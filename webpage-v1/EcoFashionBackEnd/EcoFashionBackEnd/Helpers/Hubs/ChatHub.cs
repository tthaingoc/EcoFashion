using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using EcoFashionBackEnd.Services.Interfaces;

namespace EcoFashionBackEnd.Helpers.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IChatService _chatService;

        public ChatHub(IChatService chatService)
        {
            _chatService = chatService;
        }

        /// <summary>
        /// When user connects, add them to their session group(s)
        /// </summary>
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirstValue("sub")
                         ?? Context.User?.FindFirstValue(ClaimTypes.NameIdentifier)
                         ?? Context.ConnectionId;

            var isAdmin = Context.User?.IsInRole("admin") == true;

            if (isAdmin)
            {
                // Admins join a global admin group to receive notifications about new sessions
                await Groups.AddToGroupAsync(Context.ConnectionId, "admins");

                // Also join all active session groups
                var sessions = await _chatService.GetAllSessionsAsync(includeInactive: false);

                foreach (var session in sessions)
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, SessionGroup(session.SessionId));
                }
            }
            else
            {
                // Regular users get or create their session and join it
                var session = await _chatService.GetOrCreateSessionAsync(userId);
                await Groups.AddToGroupAsync(Context.ConnectionId, SessionGroup(session.SessionId));
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var isAdmin = Context.User?.IsInRole("admin") == true;

            if (isAdmin)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, "admins");
            }

            await base.OnDisconnectedAsync(exception);
        }

        private static string SessionGroup(int sessionId) => $"session_{sessionId}";

        /// <summary>
        /// User sends message in their session
        /// </summary>
        public async Task SendMessage(string text)
        {
            try
            {
                var fromUserId = Context.User?.FindFirstValue("sub")
                                 ?? Context.User?.FindFirstValue(ClaimTypes.NameIdentifier)
                                 ?? "unknown";

                var isAdmin = Context.User?.IsInRole("admin") == true;

                if (isAdmin)
                {
                    await Clients.Caller.SendAsync("Error", new
                    {
                        message = "Admins must use SendMessageToSession to specify which session to send to"
                    });
                    return;
                }

                // Get or create session for this user
                var session = await _chatService.GetOrCreateSessionAsync(fromUserId);

                // Create and save message via service
                var message = await _chatService.SendMessageAsync(
                    session.SessionId,
                    fromUserId,
                    text,
                    fromAdmin: false
                );

                // Broadcast to session group (includes admins and the user)
                await Clients.Group(SessionGroup(session.SessionId)).SendAsync("ReceiveMessage", new
                {
                    id = message.Id,
                    sessionId = message.ChatSessionId,
                    fromUserId = message.FromUserId,
                    text = message.Text,
                    sentAt = message.SentAt,
                    fromAdmin = message.FromAdmin,
                    isRead = message.IsRead
                });

                // Also notify admins group for new message indicator
                await Clients.Group("admins").SendAsync("NewMessageNotification", new
                {
                    sessionId = session.SessionId,
                    userId = session.UserId,
                    messagePreview = text.Length > 50 ? text.Substring(0, 50) + "..." : text
                });

                // If this is a new session, notify admins
                if (session.Messages.Count == 1)
                {
                    await Clients.Group("admins").SendAsync("NewSession", new
                    {
                        sessionId = session.SessionId,
                        userId = session.UserId,
                        createdAt = session.CreatedAt
                    });
                }
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("Error", new
                {
                    message = "Failed to send message",
                    details = ex.Message
                });
            }
        }

        /// <summary>
        /// Admin sends message to a specific session
        /// </summary>
        [Authorize(Roles = "admin")]
        public async Task SendMessageToSession(int sessionId, string text)
        {
            try
            {
                var fromAdminId = Context.User?.FindFirstValue("sub")
                                  ?? Context.User?.FindFirstValue(ClaimTypes.NameIdentifier)
                                  ?? "admin";

                // Verify session exists and get it
                var session = await _chatService.GetSessionByIdAsync(sessionId);

                // Create and save message via service
                var message = await _chatService.SendMessageAsync(
                    sessionId,
                    fromAdminId,
                    text,
                    fromAdmin: true
                );

                // Broadcast to session group (includes the customer and admins)
                await Clients.Group(SessionGroup(sessionId)).SendAsync("ReceiveMessage", new
                {
                    id = message.Id,
                    sessionId = message.ChatSessionId,
                    fromUserId = message.FromUserId,
                    text = message.Text,
                    sentAt = message.SentAt,
                    fromAdmin = message.FromAdmin,
                    isRead = message.IsRead
                });
            }
            catch (KeyNotFoundException ex)
            {
                await Clients.Caller.SendAsync("Error", new
                {
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("Error", new
                {
                    message = "Failed to send message",
                    details = ex.Message
                });
            }
        }

        /// <summary>
        /// Join a specific session (for admins when they open a conversation)
        /// </summary>
        [Authorize(Roles = "admin")]
        public async Task JoinSession(int sessionId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, SessionGroup(sessionId));

            await Clients.Caller.SendAsync("JoinedSession", new
            {
                sessionId = sessionId
            });
        }

        /// <summary>
        /// Leave a specific session (for admins when they close a conversation)
        /// </summary>
        [Authorize(Roles = "admin")]
        public async Task LeaveSession(int sessionId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, SessionGroup(sessionId));

            await Clients.Caller.SendAsync("LeftSession", new
            {
                sessionId = sessionId
            });
        }

        /// <summary>
        /// Notify that user is typing (scoped to session)
        /// </summary>
        public async Task Typing(int? sessionId = null)
        {
            try
            {
                var userId = Context.User?.FindFirstValue("sub")
                             ?? Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);

                var isAdmin = Context.User?.IsInRole("admin") == true;

                int? targetSessionId = sessionId;

                // If not admin and no sessionId provided, get their active session
                if (!isAdmin && !targetSessionId.HasValue && userId != null)
                {
                    var session = await _chatService.GetOrCreateSessionAsync(userId);
                    targetSessionId = session.SessionId;
                }

                if (targetSessionId.HasValue)
                {
                    // Broadcast to everyone in the session except the sender
                    await Clients.OthersInGroup(SessionGroup(targetSessionId.Value))
                        .SendAsync("UserTyping", new
                        {
                            sessionId = targetSessionId.Value,
                            userId = userId,
                            isAdmin = isAdmin
                        });
                }
            }
            catch (Exception ex)
            {
                // Typing errors shouldn't be critical, just log
                Console.WriteLine($"Typing error: {ex.Message}");
            }
        }
    }
}
