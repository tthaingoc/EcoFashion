using System.ComponentModel.DataAnnotations;

namespace EcoFashionBackEnd.Dtos.Chat
{
    public class CreateMessageRequest
    {
        [Required]
        [StringLength(2000, MinimumLength = 1)]
        public string Text { get; set; } = string.Empty;
    }
}
