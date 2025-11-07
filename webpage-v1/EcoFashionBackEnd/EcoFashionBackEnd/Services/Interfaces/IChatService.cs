using EcoFashionBackEnd.Dtos.Chat;

namespace EcoFashionBackEnd.Services.Interfaces
{
    public interface IChatService
    {
        // Session management
        Task<ChatSessionDto> GetOrCreateSessionAsync(string userId);
        Task<List<ChatSessionSummaryDto>> GetAllSessionsAsync(bool includeInactive = false);
        Task<ChatSessionDto> GetSessionByIdAsync(int sessionId);
        Task AssignAdminToSessionAsync(int sessionId, string adminId);
        Task CloseSessionAsync(int sessionId);

        // Messaging
        Task<ChatMessageDto> SendMessageAsync(int sessionId, string fromUserId, string text, bool fromAdmin);
        Task<List<ChatMessageDto>> GetSessionMessagesAsync(int sessionId);
        Task MarkMessagesAsReadAsync(int sessionId, bool isAdmin);

        // Validation
        Task<bool> UserCanAccessSessionAsync(int sessionId, string userId, bool isAdmin);
    }
}
