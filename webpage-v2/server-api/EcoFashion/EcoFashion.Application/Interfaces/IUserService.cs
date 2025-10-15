using EcoFashion.Application.DTOs.Auth;
using EcoFashion.Application.DTOs.User;

namespace EcoFashion.Application.Interfaces
{
    public interface IUserService
    {
        Task<AuthResponse> LoginAsync(UserLoginRequest request);
        Task<SignupResponse> SignupAsync(SignupRequest request);
        Task<bool> VerifyOTPAsync(VerifyOTPRequest request);
        Task<bool> ResendOTPAsync(string email);
        Task<OTPStatusResponse> GetOTPStatusAsync(string email);
    }
}
