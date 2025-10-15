namespace EcoFashion.Domain.Constants
{
    public static class SecurityConstants
    {
        public const int MaxOTPAttempts = 5;
        public const int OTPLockoutMinutes = 30;
        public const int OTPExpirationMinutes = 10;
    }
}
