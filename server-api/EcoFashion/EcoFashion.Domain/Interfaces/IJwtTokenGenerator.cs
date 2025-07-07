using EcoFashion.Domain.Entities;

namespace EcoFashion.Domain.Interfaces
{
    public interface IJwtTokenGenerator
    {
        string GenerateToken(User user);
        string? ValidateToken(string token);
        DateTime GetTokenExpiration(string token);
    }
}
