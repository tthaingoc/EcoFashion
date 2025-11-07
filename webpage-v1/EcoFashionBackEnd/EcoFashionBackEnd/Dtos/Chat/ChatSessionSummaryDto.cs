namespace EcoFashionBackEnd.Dtos.Chat
{
    /// <summary>
    /// Summary of chat session for admin list view
    /// </summary>
    public class ChatSessionSummaryDto
    {
        public int SessionId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string? AdminId { get; set; }
        public bool IsActive { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset LastMessageAt { get; set; }
        public int UnreadCount { get; set; }
        public ChatMessageDto? LastMessage { get; set; }
    }
}
