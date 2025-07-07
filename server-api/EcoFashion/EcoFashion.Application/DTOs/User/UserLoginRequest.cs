using System.ComponentModel.DataAnnotations;

namespace EcoFashion.Application.DTOs.User;

public class UserLoginRequest
{
        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;
}
