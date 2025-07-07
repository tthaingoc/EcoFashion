using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;
using EcoFashion.Application.DTOs.Email;
using EcoFashion.Application.Interfaces;
using EcoFashion.Application.Common.Settings;

namespace EcoFashion.Infrastructure.Services
{
    public class EmailService : IEmailService
    {
        private readonly MailSettings _mailSettings;

        public EmailService(IOptions<MailSettings> mailSettings)
        {
            _mailSettings = mailSettings.Value;
        }

        public async Task<bool> SendEmailAsync(MailData mailData)
        {
            try
            {
                using var smtpClient = new SmtpClient(_mailSettings.Server)
                {
                    Port = int.Parse(_mailSettings.Port),
                    Credentials = new NetworkCredential(_mailSettings.UserName, _mailSettings.Password),
                    EnableSsl = true
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_mailSettings.SenderEmail, _mailSettings.SenderName),
                    Subject = mailData.Subject,
                    Body = mailData.Body,
                    IsBodyHtml = false
                };

                mailMessage.To.Add(new MailAddress(mailData.To, mailData.DisplayName ?? mailData.To.Split('@')[0]));

                await smtpClient.SendMailAsync(mailMessage);
                Console.WriteLine($"Email sent successfully to {mailData.To}");
                return true;
            }
            catch (Exception ex)
            {
                // Log the exception here if you have a logging service
                Console.WriteLine($"Error sending email to {mailData.To}: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return false;
            }
        }

        public async Task<bool> SendOTPEmailAsync(string email, string otp)
        {
            var mailData = new MailData
            {
                To = email,
                DisplayName = email.Split('@')[0], // Sử dụng phần trước @ làm tên
                Subject = "Xác thực tài khoản EcoFashion",
                Body = $"Mã OTP của bạn là: {otp}\n\nMã này sẽ hết hạn sau 10 phút.\n\nVui lòng không chia sẻ mã này với bất kỳ ai."
            };

            return await SendEmailAsync(mailData);
        }

        public async Task<bool> SendWelcomeEmailAsync(string email, string name)
        {
            var mailData = new MailData
            {
                To = email,
                DisplayName = name,
                Subject = "Chào mừng đến với EcoFashion",
                Body = $"Xin chào {name},\n\nChào mừng bạn đến với EcoFashion! Tài khoản của bạn đã được tạo thành công."
            };

            return await SendEmailAsync(mailData);
        }
    }
}
