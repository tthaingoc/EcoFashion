namespace EcoFashionBackEnd.Dtos.Chat
{
    public class ChatSessionDto
    {
        public int SessionId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string? AdminId { get; set; }
        public bool IsActive { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset LastMessageAt { get; set; }
        public List<ChatMessageDto> Messages { get; set; } = new();
    }
}
