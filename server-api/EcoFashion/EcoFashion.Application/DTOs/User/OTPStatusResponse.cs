namespace EcoFashion.Application.DTOs.User;

public class OTPStatusResponse
{
    public bool IsVerified { get; set; }
    public bool IsLocked { get; set; }
    public int AttemptCount { get; set; }
    public int MaxAttempts { get; set; }
    public DateTime? LockoutExpiresAt { get; set; }
    public DateTime? OTPExpiresAt { get; set; }
    public string Message { get; set; } = string.Empty;
}
