
using System.ComponentModel.DataAnnotations;

namespace EcoFashion.Application.DTOs.User;

public class ResendOTPRequest
{
    [Required(ErrorMessage = "Email là bắt buộc.")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
    public string Email { get; set; } = string.Empty;
}
