using System.ComponentModel.DataAnnotations;

namespace EcoFashion.Application.DTOs.User;

public class VerifyOTPRequest
{
    [Required(ErrorMessage = "Email là bắt buộc.")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mã OTP là bắt buộc.")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "Mã OTP phải có 6 ký tự.")]
    public string OTPCode { get; set; } = string.Empty;
}
