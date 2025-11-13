using System.Net;
using System.Net.Mail;
using EcoFashionBackEnd.Helpers;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace EcoFashionBackEnd.Services
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
                // Validate MailSettings
                if (string.IsNullOrWhiteSpace(_mailSettings?.Server) ||
                    string.IsNullOrWhiteSpace(_mailSettings?.UserName) ||
                    string.IsNullOrWhiteSpace(_mailSettings?.Password))
                {
                    return false;
                }

                using var smtpClient = new SmtpClient(_mailSettings.Server, int.Parse(_mailSettings.Port))
                {
                    EnableSsl = true,
                    Credentials = new NetworkCredential(_mailSettings.UserName, _mailSettings.Password)
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_mailSettings.SenderEmail, _mailSettings.SenderName),
                    Subject = mailData.EmailSubject,
                    Body = mailData.EmailBody,
                    IsBodyHtml = true
                };

                mailMessage.To.Add(mailData.EmailToId);

                await smtpClient.SendMailAsync(mailMessage);

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[EmailService] Failed to send email: {ex.Message}");
                return false;
            }
        }
    }
}
