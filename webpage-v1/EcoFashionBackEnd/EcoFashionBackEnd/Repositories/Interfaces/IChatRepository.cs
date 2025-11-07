using EcoFashionBackEnd.Entities;

namespace EcoFashionBackEnd.Repositories.Interfaces
{
    public interface IChatRepository
    {
        // Session operations
        Task<ChatSession?> GetSessionByIdAsync(int sessionId, bool includeMessages = false);
        Task<ChatSession?> GetActiveSessionByUserIdAsync(string userId, bool includeMessages = false);
        Task<List<ChatSession>> GetAllActiveSessionsAsync(bool includeMessages = false);
        Task<List<ChatSession>> GetAllSessionsAsync(bool includeInactive, bool includeMessages = false);
        Task<ChatSession> CreateSessionAsync(ChatSession session);
        Task UpdateSessionAsync(ChatSession session);

        // Message operations
        Task<ChatMessage> CreateMessageAsync(ChatMessage message);
        Task<List<ChatMessage>> GetSessionMessagesAsync(int sessionId);
        Task<int> GetUnreadMessageCountAsync(int sessionId, bool forAdmin);
        Task MarkMessagesAsReadAsync(int sessionId, bool isAdmin);

        // Helper
        Task<bool> SessionExistsAsync(int sessionId);
    }
}
