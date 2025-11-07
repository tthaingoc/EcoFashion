using EcoFashionBackEnd.Dtos.Chat;
using EcoFashionBackEnd.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EcoFashionBackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;

        public ChatController(IChatService chatService)
        {
            _chatService = chatService;
        }

        /// <summary>
        /// Get or create a chat session for the current user
        /// </summary>
        [HttpGet("session")]
        public async Task<IActionResult> GetOrCreateSession()
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                                    ?? User.FindFirstValue("sub");

                if (string.IsNullOrEmpty(currentUserId))
                {
                    return Unauthorized(new { ErrorMessage = "User ID not found in token" });
                }

                var isAdmin = User.IsInRole("admin");

                // Admins don't have their own sessions
                if (isAdmin)
                {
                    return BadRequest(new { ErrorMessage = "Admins don't have chat sessions. Use GetAllSessions instead." });
                }

                var session = await _chatService.GetOrCreateSessionAsync(currentUserId);

                return Ok(new { Success = true, Result = session });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { ErrorMessage = "An error occurred while getting the session", Details = ex.Message });
            }
        }

        /// <summary>
        /// Get all chat sessions (admin only)
        /// </summary>
        [HttpGet("sessions")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAllSessions([FromQuery] bool includeInactive = false)
        {
            try
            {
                var sessions = await _chatService.GetAllSessionsAsync(includeInactive);
                return Ok(new { Success = true, Result = sessions });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { ErrorMessage = "An error occurred while getting sessions", Details = ex.Message });
            }
        }

        /// <summary>
        /// Get messages for a specific session
        /// </summary>
        [HttpGet("session/{sessionId}/messages")]
        public async Task<IActionResult> GetSessionMessages(int sessionId)
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                                    ?? User.FindFirstValue("sub");

                if (string.IsNullOrEmpty(currentUserId))
                {
                    return Unauthorized(new { ErrorMessage = "User ID not found in token" });
                }

                var isAdmin = User.IsInRole("admin");

                // Verify user can access this session
                var canAccess = await _chatService.UserCanAccessSessionAsync(sessionId, currentUserId, isAdmin);

                if (!canAccess)
                {
                    return Forbid();
                }

                var session = await _chatService.GetSessionByIdAsync(sessionId);

                return Ok(new { Success = true, Result = session });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { ErrorMessage = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { ErrorMessage = "An error occurred while getting session messages", Details = ex.Message });
            }
        }

        /// <summary>
        /// Mark messages as read
        /// </summary>
        [HttpPost("session/{sessionId}/mark-read")]
        public async Task<IActionResult> MarkAsRead(int sessionId)
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                                    ?? User.FindFirstValue("sub");

                if (string.IsNullOrEmpty(currentUserId))
                {
                    return Unauthorized(new { ErrorMessage = "User ID not found in token" });
                }

                var isAdmin = User.IsInRole("admin");

                // Verify user can access this session
                var canAccess = await _chatService.UserCanAccessSessionAsync(sessionId, currentUserId, isAdmin);

                if (!canAccess)
                {
                    return Forbid();
                }

                await _chatService.MarkMessagesAsReadAsync(sessionId, isAdmin);

                return Ok(new { Success = true, Message = "Messages marked as read" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { ErrorMessage = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { ErrorMessage = "An error occurred while marking messages as read", Details = ex.Message });
            }
        }

        /// <summary>
        /// Assign admin to a session (admin only)
        /// </summary>
        [HttpPost("session/{sessionId}/assign")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> AssignAdminToSession(int sessionId)
        {
            try
            {
                var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                             ?? User.FindFirstValue("sub");

                if (string.IsNullOrEmpty(adminId))
                {
                    return Unauthorized(new { ErrorMessage = "User ID not found in token" });
                }

                await _chatService.AssignAdminToSessionAsync(sessionId, adminId);

                return Ok(new { Success = true, Message = "Admin assigned to session" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { ErrorMessage = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { ErrorMessage = "An error occurred while assigning admin", Details = ex.Message });
            }
        }

        /// <summary>
        /// Close a chat session (admin only)
        /// </summary>
        [HttpPost("session/{sessionId}/close")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CloseSession(int sessionId)
        {
            try
            {
                await _chatService.CloseSessionAsync(sessionId);
                return Ok(new { Success = true, Message = "Session closed" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { ErrorMessage = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { ErrorMessage = "An error occurred while closing session", Details = ex.Message });
            }
        }
    }
}
