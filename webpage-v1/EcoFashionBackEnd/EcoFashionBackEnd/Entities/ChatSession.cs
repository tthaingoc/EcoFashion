using System;
using System.Collections.Generic;

namespace EcoFashionBackEnd.Entities
{
    public class ChatSession
    {
        public int Id { get; set; }

        /// <summary>
        /// User who initiated the chat (customer)
        /// </summary>
        public string UserId { get; set; } = string.Empty;

        /// <summary>
        /// Admin assigned to this session (optional - can be null if no admin assigned yet)
        /// </summary>
        public string? AdminId { get; set; }

        /// <summary>
        /// Session status - open/closed
        /// </summary>
        public bool IsActive { get; set; } = true;

        /// <summary>
        /// When the session was created
        /// </summary>
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

        /// <summary>
        /// Last message time (for sorting sessions)
        /// </summary>
        public DateTimeOffset LastMessageAt { get; set; } = DateTimeOffset.UtcNow;

        /// <summary>
        /// All messages in this session
        /// </summary>
        public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }
}
