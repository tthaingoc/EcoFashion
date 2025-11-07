using EcoFashionBackEnd.Dtos.Chat;
using EcoFashionBackEnd.Entities;
using EcoFashionBackEnd.Repositories.Interfaces;
using EcoFashionBackEnd.Services.Interfaces;

namespace EcoFashionBackEnd.Services
{
    public class ChatService : IChatService
    {
        private readonly IChatRepository _chatRepository;

        public ChatService(IChatRepository chatRepository)
        {
            _chatRepository = chatRepository;
        }

        #region Session Management

        public async Task<ChatSessionDto> GetOrCreateSessionAsync(string userId)
        {
            // Try to get existing active session
            var session = await _chatRepository.GetActiveSessionByUserIdAsync(userId, includeMessages: true);

            if (session == null)
            {
                // Create new session
                session = new ChatSession
                {
                    UserId = userId,
                    IsActive = true,
                    CreatedAt = DateTimeOffset.UtcNow,
                    LastMessageAt = DateTimeOffset.UtcNow
                };

                session = await _chatRepository.CreateSessionAsync(session);
            }

            return MapToSessionDto(session);
        }

        public async Task<List<ChatSessionSummaryDto>> GetAllSessionsAsync(bool includeInactive = false)
        {
            var sessions = await _chatRepository.GetAllSessionsAsync(includeInactive, includeMessages: true);

            return sessions.Select(s => new ChatSessionSummaryDto
            {
                SessionId = s.Id,
                UserId = s.UserId,
                AdminId = s.AdminId,
                IsActive = s.IsActive,
                CreatedAt = s.CreatedAt,
                LastMessageAt = s.LastMessageAt,
                UnreadCount = s.Messages.Count(m => !m.IsRead && !m.FromAdmin),
                LastMessage = s.Messages
                    .OrderByDescending(m => m.SentAt)
                    .Select(m => new ChatMessageDto
                    {
                        Id = m.Id,
                        ChatSessionId = m.ChatSessionId,
                        FromUserId = m.FromUserId,
                        Text = m.Text,
                        SentAt = m.SentAt,
                        FromAdmin = m.FromAdmin,
                        IsRead = m.IsRead
                    })
                    .FirstOrDefault()
            }).ToList();
        }

        public async Task<ChatSessionDto> GetSessionByIdAsync(int sessionId)
        {
            var session = await _chatRepository.GetSessionByIdAsync(sessionId, includeMessages: true);

            if (session == null)
            {
                throw new KeyNotFoundException($"Session with ID {sessionId} not found");
            }

            return MapToSessionDto(session);
        }

        public async Task AssignAdminToSessionAsync(int sessionId, string adminId)
        {
            var session = await _chatRepository.GetSessionByIdAsync(sessionId);

            if (session == null)
            {
                throw new KeyNotFoundException($"Session with ID {sessionId} not found");
            }

            session.AdminId = adminId;
            await _chatRepository.UpdateSessionAsync(session);
        }

        public async Task CloseSessionAsync(int sessionId)
        {
            var session = await _chatRepository.GetSessionByIdAsync(sessionId);

            if (session == null)
            {
                throw new KeyNotFoundException($"Session with ID {sessionId} not found");
            }

            session.IsActive = false;
            await _chatRepository.UpdateSessionAsync(session);
        }

        #endregion

        #region Messaging

        public async Task<ChatMessageDto> SendMessageAsync(int sessionId, string fromUserId, string text, bool fromAdmin)
        {
            // Verify session exists
            var session = await _chatRepository.GetSessionByIdAsync(sessionId);

            if (session == null)
            {
                throw new KeyNotFoundException($"Session with ID {sessionId} not found");
            }

            // Create message
            var message = new ChatMessage
            {
                ChatSessionId = sessionId,
                FromUserId = fromUserId,
                Text = text,
                SentAt = DateTimeOffset.UtcNow,
                FromAdmin = fromAdmin,
                IsRead = false
            };

            message = await _chatRepository.CreateMessageAsync(message);

            // Update session last message time
            session.LastMessageAt = message.SentAt;
            await _chatRepository.UpdateSessionAsync(session);

            return MapToMessageDto(message);
        }

        public async Task<List<ChatMessageDto>> GetSessionMessagesAsync(int sessionId)
        {
            var messages = await _chatRepository.GetSessionMessagesAsync(sessionId);
            return messages.Select(MapToMessageDto).ToList();
        }

        public async Task MarkMessagesAsReadAsync(int sessionId, bool isAdmin)
        {
            await _chatRepository.MarkMessagesAsReadAsync(sessionId, isAdmin);
        }

        #endregion

        #region Validation

        public async Task<bool> UserCanAccessSessionAsync(int sessionId, string userId, bool isAdmin)
        {
            var session = await _chatRepository.GetSessionByIdAsync(sessionId);

            if (session == null)
            {
                return false;
            }

            // Admins can access all sessions
            if (isAdmin)
            {
                return true;
            }

            // Regular users can only access their own sessions
            return session.UserId == userId;
        }

        #endregion

        #region Mapping Helpers

        private ChatSessionDto MapToSessionDto(ChatSession session)
        {
            return new ChatSessionDto
            {
                SessionId = session.Id,
                UserId = session.UserId,
                AdminId = session.AdminId,
                IsActive = session.IsActive,
                CreatedAt = session.CreatedAt,
                LastMessageAt = session.LastMessageAt,
                Messages = session.Messages?
                    .OrderBy(m => m.SentAt)
                    .Select(MapToMessageDto)
                    .ToList() ?? new List<ChatMessageDto>()
            };
        }

        private ChatMessageDto MapToMessageDto(ChatMessage message)
        {
            return new ChatMessageDto
            {
                Id = message.Id,
                ChatSessionId = message.ChatSessionId,
                FromUserId = message.FromUserId,
                Text = message.Text,
                SentAt = message.SentAt,
                FromAdmin = message.FromAdmin,
                IsRead = message.IsRead
            };
        }

        #endregion
    }
}
