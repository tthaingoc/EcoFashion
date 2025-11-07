namespace EcoFashionBackEnd.Dtos.Chat
{
    public class ChatMessageDto
    {
        public int Id { get; set; }
        public int ChatSessionId { get; set; }
        public string FromUserId { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public DateTimeOffset SentAt { get; set; }
        public bool FromAdmin { get; set; }
        public bool IsRead { get; set; }
    }
}
