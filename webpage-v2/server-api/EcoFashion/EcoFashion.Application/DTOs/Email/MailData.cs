namespace EcoFashion.Application.DTOs.Email
{
    public class MailData
    {
        public string To { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string? From { get; set; }
        public string? DisplayName { get; set; }
        public List<string>? CC { get; set; }
        public List<string>? BCC { get; set; }
        public List<string>? Attachments { get; set; }
    }
}
