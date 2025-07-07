using EcoFashion.Application.DTOs.Email;

namespace EcoFashion.Application.Interfaces;

public interface IEmailService
{
    Task<bool> SendEmailAsync(MailData mailData);
    Task<bool> SendOTPEmailAsync(string email, string otpCode);
    Task<bool> SendWelcomeEmailAsync(string email, string username);
}