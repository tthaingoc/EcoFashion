using System.ComponentModel.DataAnnotations;

namespace EcoFashion.Application.DTOs.User;

public class SignupRequest
{
    [Required(ErrorMessage = "Email là bắt buộc.")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
    [StringLength(100, ErrorMessage = "Email không được quá 100 ký tự.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mật khẩu là bắt buộc.")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu phải từ 6 đến 100 ký tự.")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Họ tên là bắt buộc.")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Họ tên phải từ 2 đến 100 ký tự.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tên đăng nhập là bắt buộc.")]
    [StringLength(30, MinimumLength = 3, ErrorMessage = "Tên đăng nhập phải từ 3 đến 30 ký tự.")]
    public string Username { get; set; } = string.Empty;

    [Phone(ErrorMessage = "Số điện thoại không hợp lệ.")]
    [StringLength(10, ErrorMessage = "Số điện thoại không được quá 10 ký tự.")]
    public string? Phone { get; set; }
}
