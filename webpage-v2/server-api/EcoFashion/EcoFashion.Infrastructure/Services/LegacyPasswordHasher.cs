using EcoFashion.Domain.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace EcoFashion.Infrastructure.Services
{
    public class LegacyPasswordHasher : IPasswordHasher
    {
        public string HashPassword(string password)
        {
            // Use SHA256 for compatibility with v1
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            var stringBuilder = new StringBuilder();

            foreach (var b in hash)
            {
                stringBuilder.Append(b.ToString("x2"));
            }

            return stringBuilder.ToString();
        }

        public bool VerifyPassword(string password, string hashedPassword)
        {
            // Hash the input password
            var hashOfInput = HashPassword(password);

            // Compare the computed hash with the stored hash
            return StringComparer.OrdinalIgnoreCase.Compare(hashOfInput, hashedPassword) == 0;
        }
    }
}
