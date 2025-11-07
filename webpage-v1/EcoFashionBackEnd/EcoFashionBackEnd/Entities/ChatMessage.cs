using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EcoFashionBackEnd.Entities
{
    public class ChatMessage
    {
        public int Id { get; set; }

        /// <summary>
        /// Reference to the chat session this message belongs to
        /// </summary>
        public int ChatSessionId { get; set; }
        public ChatSession ChatSession { get; set; } = null!;

        /// <summary>
        /// User ID of the sender (can be customer or admin)
        /// </summary>
        public string FromUserId { get; set; } = string.Empty;

        /// <summary>
        /// Message text content
        /// </summary>
        public string Text { get; set; } = string.Empty;

        /// <summary>
        /// When the message was sent
        /// </summary>
        public DateTimeOffset SentAt { get; set; } = DateTimeOffset.UtcNow;

        /// <summary>
        /// Whether this message is from an admin
        /// </summary>
        public bool FromAdmin { get; set; }

        /// <summary>
        /// Whether this message has been read by the recipient
        /// </summary>
        public bool IsRead { get; set; } = false;
    }
}