using EcoFashionBackEnd.Entities;
using EcoFashionBackEnd.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EcoFashionBackEnd.Repositories
{
    public class ChatRepository : IChatRepository
    {
        private readonly AppDbContext _context;

        public ChatRepository(AppDbContext context)
        {
            _context = context;
        }

        #region Session Operations

        public async Task<ChatSession?> GetSessionByIdAsync(int sessionId, bool includeMessages = false)
        {
            var query = _context.ChatSessions.AsQueryable();

            if (includeMessages)
            {
                query = query.Include(s => s.Messages);
            }

            var session = await query.FirstOrDefaultAsync(s => s.Id == sessionId);

            // Order messages in memory after retrieval
            if (session != null && includeMessages && session.Messages != null)
            {
                session.Messages = session.Messages.OrderBy(m => m.SentAt).ToList();
            }

            return session;
        }

        public async Task<ChatSession?> GetActiveSessionByUserIdAsync(string userId, bool includeMessages = false)
        {
            var query = _context.ChatSessions
                .Where(s => s.UserId == userId && s.IsActive);

            if (includeMessages)
            {
                query = query.Include(s => s.Messages);
            }

            var session = await query.FirstOrDefaultAsync();

            // Order messages in memory after retrieval
            if (session != null && includeMessages && session.Messages != null)
            {
                session.Messages = session.Messages.OrderBy(m => m.SentAt).ToList();
            }

            return session;
        }

        public async Task<List<ChatSession>> GetAllActiveSessionsAsync(bool includeMessages = false)
        {
            IQueryable<ChatSession> query = _context.ChatSessions
                .Where(s => s.IsActive);

            if (includeMessages)
            {
                query = query.Include(s => s.Messages);
            }

            var sessions = await query
                .OrderByDescending(s => s.LastMessageAt)
                .ToListAsync();

            // Order messages in memory after retrieval
            if (includeMessages)
            {
                foreach (var session in sessions)
                {
                    if (session.Messages != null)
                    {
                        session.Messages = session.Messages.OrderBy(m => m.SentAt).ToList();
                    }
                }
            }

            return sessions;
        }

        public async Task<List<ChatSession>> GetAllSessionsAsync(bool includeInactive, bool includeMessages = false)
        {
            IQueryable<ChatSession> query = _context.ChatSessions.AsQueryable();

            if (!includeInactive)
            {
                query = query.Where(s => s.IsActive);
            }

            if (includeMessages)
            {
                query = query.Include(s => s.Messages);
            }

            var sessions = await query
                .OrderByDescending(s => s.LastMessageAt)
                .ToListAsync();

            // Order messages in memory after retrieval
            if (includeMessages)
            {
                foreach (var session in sessions)
                {
                    if (session.Messages != null)
                    {
                        session.Messages = session.Messages.OrderBy(m => m.SentAt).ToList();
                    }
                }
            }

            return sessions;
        }

        public async Task<ChatSession> CreateSessionAsync(ChatSession session)
        {
            _context.ChatSessions.Add(session);
            await _context.SaveChangesAsync();
            return session;
        }

        public async Task UpdateSessionAsync(ChatSession session)
        {
            _context.ChatSessions.Update(session);
            await _context.SaveChangesAsync();
        }

        #endregion

        #region Message Operations

        public async Task<ChatMessage> CreateMessageAsync(ChatMessage message)
        {
            _context.ChatMessages.Add(message);
            await _context.SaveChangesAsync();
            return message;
        }

        public async Task<List<ChatMessage>> GetSessionMessagesAsync(int sessionId)
        {
            return await _context.ChatMessages
                .Where(m => m.ChatSessionId == sessionId)
                .OrderBy(m => m.SentAt)
                .ToListAsync();
        }

        public async Task<int> GetUnreadMessageCountAsync(int sessionId, bool forAdmin)
        {
            var query = _context.ChatMessages
                .Where(m => m.ChatSessionId == sessionId && !m.IsRead);

            if (forAdmin)
            {
                // Count unread customer messages (for admin)
                query = query.Where(m => !m.FromAdmin);
            }
            else
            {
                // Count unread admin messages (for customer)
                query = query.Where(m => m.FromAdmin);
            }

            return await query.CountAsync();
        }

        public async Task MarkMessagesAsReadAsync(int sessionId, bool isAdmin)
        {
            var messages = await _context.ChatMessages
                .Where(m => m.ChatSessionId == sessionId && !m.IsRead)
                .ToListAsync();

            IEnumerable<ChatMessage> messagesToMark;

            if (isAdmin)
            {
                // Admin marks customer messages as read
                messagesToMark = messages.Where(m => !m.FromAdmin);
            }
            else
            {
                // Customer marks admin messages as read
                messagesToMark = messages.Where(m => m.FromAdmin);
            }

            foreach (var message in messagesToMark)
            {
                message.IsRead = true;
            }

            await _context.SaveChangesAsync();
        }

        #endregion

        #region Helper Methods

        public async Task<bool> SessionExistsAsync(int sessionId)
        {
            return await _context.ChatSessions.AnyAsync(s => s.Id == sessionId);
        }

        #endregion
    }
}
