using EcoFashion.Application.DTOs.Auth;
using EcoFashion.Application.DTOs.User;
using EcoFashion.Application.Exceptions;
using EcoFashion.Application.Interfaces;
using EcoFashion.Domain.Interfaces;
using EcoFashion.Domain.Enums;
using EcoFashion.Domain.Constants;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;

namespace EcoFashion.Infrastructure.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;
        private readonly IEmailService _emailService;
        private readonly ILogger<UserService> _logger;

        public UserService(
            IUserRepository userRepository,
            IPasswordHasher passwordHasher,
            IJwtTokenGenerator jwtTokenGenerator,
            IEmailService emailService,
            ILogger<UserService> logger)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _jwtTokenGenerator = jwtTokenGenerator;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<AuthResponse> LoginAsync(UserLoginRequest request)
        {
            // Tìm user theo email (bao gồm UserRole)
            var user = await _userRepository.GetByEmailAsync(request.Email);
            if (user == null)
            {
                throw new UserNotFoundException("Tài khoản không tồn tại.");
            }

            // Kiểm tra mật khẩu - giống như v1, dùng PasswordHash field (thực chất là raw password)
            if (!_passwordHasher.VerifyPassword(request.PasswordHash, user.PasswordHash))
            {
                throw new BadRequestException("Mật khẩu không chính xác.");
            }

            // Kiểm tra trạng thái tài khoản (comment tạm để test)
            // if (user.Status != UserStatus.Active)
            // {
            //     throw new BadRequestException("Tài khoản không hoạt động.");
            // }

            // Tạo JWT token
            var token = _jwtTokenGenerator.GenerateToken(user);
            var expiresAt = _jwtTokenGenerator.GetTokenExpiration(token);

            // Tạo response giống như v1
            var response = new AuthResponse
            {
                Token = token,
                ExpiresAt = expiresAt,
                User = new UserInfo
                {
                    UserId = user.UserId,
                    FullName = user.FullName ?? "",
                    Email = user.Email ?? "",
                    Phone = user.Phone,
                    Username = user.Username,
                    Role = user.UserRole?.RoleName ?? "",
                    RoleId = user.RoleId,
                    Status = user.Status.ToString(),
                    CreatedAt = user.CreatedAt
                }
            };

            return response;
        }

        public async Task<SignupResponse> SignupAsync(SignupRequest request)
        {
            _logger.LogInformation("Starting signup process for email: {Email}", request.Email);

            try
            {
                // Kiểm tra email đã tồn tại chưa
                if (await _userRepository.EmailExistsAsync(request.Email))
                {
                    _logger.LogWarning("Signup failed - email already exists: {Email}", request.Email);
                    throw new BadRequestException("Email đã được sử dụng.");
                }

                // Kiểm tra username đã tồn tại chưa
                if (await _userRepository.UsernameExistsAsync(request.Username))
                {
                    _logger.LogWarning("Signup failed - username already exists: {Username}", request.Username);
                    throw new BadRequestException("Tên đăng nhập đã được sử dụng.");
                }

                // Tạo OTP
                var otp = GenerateSecureOTP();
                var otpExpires = DateTime.UtcNow.AddMinutes(SecurityConstants.OTPExpirationMinutes);

                _logger.LogInformation("Generated OTP for email: {Email}", request.Email);

                // Tạo user mới
                var newUser = new Domain.Entities.User
                {
                    Email = request.Email,
                    FullName = request.FullName,
                    Phone = request.Phone,
                    Username = request.Username,
                    PasswordHash = _passwordHasher.HashPassword(request.Password),
                    RoleId = 4, // Default Customer role
                    Status = Domain.Enums.UserStatus.Pending,
                    OTPCode = otp,
                    OTPExpiresAt = otpExpires,
                    OTPAttemptCount = 0,
                    OTPLockoutExpiresAt = null,
                    CreatedAt = DateTime.UtcNow,
                    LastUpdatedAt = DateTime.UtcNow
                };

                // Lưu user vào database
                await _userRepository.CreateAsync(newUser);
                _logger.LogInformation("User created successfully for email: {Email}", request.Email);

                // Gửi email OTP
                var emailResult = await _emailService.SendOTPEmailAsync(request.Email, otp);
                if (!emailResult)
                {
                    _logger.LogError("Failed to send OTP email to: {Email}", request.Email);
                    // Xóa user đã tạo nếu gửi email thất bại
                    await _userRepository.DeleteAsync(newUser.UserId);
                    throw new BadRequestException("Không thể gửi email xác thực. Vui lòng kiểm tra email và thử lại.");
                }

                _logger.LogInformation("OTP email sent successfully to: {Email}", request.Email);

                return new SignupResponse
                {
                    Success = true,
                    Message = "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
                    Email = request.Email
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during signup process for email: {Email}", request.Email);
                throw;
            }
        }

        public async Task<bool> VerifyOTPAsync(VerifyOTPRequest request)
        {
            _logger.LogInformation("Starting OTP verification for email: {Email}", request.Email);

            try
            {
                var user = await _userRepository.GetByEmailAsync(request.Email);
                if (user == null)
                {
                    _logger.LogWarning("OTP verification failed - user not found: {Email}", request.Email);
                    throw new BadRequestException("Tài khoản không tồn tại.");
                }

                if (user.Status == Domain.Enums.UserStatus.Active)
                {
                    _logger.LogWarning("OTP verification failed - account already verified: {Email}", request.Email);
                    throw new BadRequestException("Tài khoản đã được xác thực.");
                }

                // Kiểm tra lockout
                if (user.OTPLockoutExpiresAt.HasValue && user.OTPLockoutExpiresAt.Value > DateTime.UtcNow)
                {
                    var remainingLockoutTime = user.OTPLockoutExpiresAt.Value.Subtract(DateTime.UtcNow);
                    _logger.LogWarning("OTP verification failed - account locked out: {Email}, Remaining: {Minutes} minutes", 
                        request.Email, remainingLockoutTime.TotalMinutes);
                    throw new BadRequestException($"Tài khoản đã bị khóa do nhập sai OTP quá nhiều lần. Vui lòng thử lại sau {Math.Ceiling(remainingLockoutTime.TotalMinutes)} phút.");
                }

                // Kiểm tra OTP hết hạn
                if (user.OTPExpiresAt == null || user.OTPExpiresAt < DateTime.UtcNow)
                {
                    _logger.LogWarning("OTP verification failed - OTP expired: {Email}", request.Email);
                    throw new BadRequestException("Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.");
                }

                // Kiểm tra OTP
                if (string.IsNullOrEmpty(user.OTPCode) || user.OTPCode != request.OTPCode)
                {
                    // Tăng số lần thử
                    user.OTPAttemptCount++;
                    
                    // Nếu vượt quá số lần cho phép, khóa tài khoản
                    if (user.OTPAttemptCount >= SecurityConstants.MaxOTPAttempts)
                    {
                        user.OTPLockoutExpiresAt = DateTime.UtcNow.AddMinutes(SecurityConstants.OTPLockoutMinutes);
                        _logger.LogWarning("Account locked due to too many OTP attempts: {Email}", request.Email);
                        await _userRepository.UpdateAsync(user);
                        throw new BadRequestException($"Tài khoản đã bị khóa do nhập sai OTP quá nhiều lần. Vui lòng thử lại sau {SecurityConstants.OTPLockoutMinutes} phút.");
                    }

                    user.LastUpdatedAt = DateTime.UtcNow;
                    await _userRepository.UpdateAsync(user);

                    _logger.LogWarning("Invalid OTP attempt for email: {Email}, Attempts: {Attempts}/{MaxAttempts}", 
                        request.Email, user.OTPAttemptCount, SecurityConstants.MaxOTPAttempts);
                    throw new BadRequestException($"Mã OTP không chính xác. Còn lại {SecurityConstants.MaxOTPAttempts - user.OTPAttemptCount} lần thử.");
                }

                // OTP hợp lệ - kích hoạt tài khoản
                user.Status = Domain.Enums.UserStatus.Active;
                user.OTPCode = null;
                user.OTPExpiresAt = null;
                user.OTPAttemptCount = 0;
                user.OTPLockoutExpiresAt = null;
                user.LastUpdatedAt = DateTime.UtcNow;

                await _userRepository.UpdateAsync(user);

                _logger.LogInformation("OTP verification successful for email: {Email}", request.Email);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during OTP verification for email: {Email}", request.Email);
                throw;
            }
        }

        public async Task<bool> ResendOTPAsync(string email)
        {
            _logger.LogInformation("Starting OTP resend for email: {Email}", email);

            try
            {
                var user = await _userRepository.GetByEmailAsync(email);
                if (user == null)
                {
                    _logger.LogWarning("OTP resend failed - user not found: {Email}", email);
                    throw new BadRequestException("Tài khoản không tồn tại.");
                }

                if (user.Status == Domain.Enums.UserStatus.Active)
                {
                    _logger.LogWarning("OTP resend failed - account already verified: {Email}", email);
                    throw new BadRequestException("Tài khoản đã được xác thực.");
                }

                // Kiểm tra lockout
                if (user.OTPLockoutExpiresAt.HasValue && user.OTPLockoutExpiresAt.Value > DateTime.UtcNow)
                {
                    var remainingLockoutTime = user.OTPLockoutExpiresAt.Value.Subtract(DateTime.UtcNow);
                    _logger.LogWarning("OTP resend failed - account locked out: {Email}, Remaining: {Minutes} minutes", 
                        email, remainingLockoutTime.TotalMinutes);
                    throw new BadRequestException($"Tài khoản đã bị khóa do nhập sai OTP quá nhiều lần. Vui lòng thử lại sau {Math.Ceiling(remainingLockoutTime.TotalMinutes)} phút.");
                }

                // Tạo OTP mới
                var otp = GenerateSecureOTP();
                var otpExpires = DateTime.UtcNow.AddMinutes(SecurityConstants.OTPExpirationMinutes);

                // Reset attempt count when resending
                user.OTPCode = otp;
                user.OTPExpiresAt = otpExpires;
                user.OTPAttemptCount = 0;
                user.LastUpdatedAt = DateTime.UtcNow;

                await _userRepository.UpdateAsync(user);

                // Gửi email OTP mới
                var emailResult = await _emailService.SendOTPEmailAsync(email, otp);
                if (!emailResult)
                {
                    _logger.LogError("Failed to send OTP email to: {Email}", email);
                    throw new BadRequestException("Không thể gửi email xác thực. Vui lòng thử lại sau.");
                }

                _logger.LogInformation("OTP resent successfully to: {Email}", email);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during OTP resend for email: {Email}", email);
                throw;
            }
        }

        public async Task<OTPStatusResponse> GetOTPStatusAsync(string email)
        {
            _logger.LogInformation("Checking OTP status for email: {Email}", email);

            try
            {
                var user = await _userRepository.GetByEmailAsync(email);
                if (user == null)
                {
                    _logger.LogWarning("OTP status check failed - user not found: {Email}", email);
                    throw new BadRequestException("Tài khoản không tồn tại.");
                }

                var isLocked = user.OTPLockoutExpiresAt.HasValue && user.OTPLockoutExpiresAt.Value > DateTime.UtcNow;
                var otpExpired = user.OTPExpiresAt.HasValue && user.OTPExpiresAt.Value < DateTime.UtcNow;

                return new OTPStatusResponse
                {
                    IsVerified = user.Status == Domain.Enums.UserStatus.Active,
                    IsLocked = isLocked,
                    AttemptCount = user.OTPAttemptCount,
                    MaxAttempts = SecurityConstants.MaxOTPAttempts,
                    LockoutExpiresAt = user.OTPLockoutExpiresAt,
                    OTPExpiresAt = user.OTPExpiresAt,
                    Message = GetOTPStatusMessage(user, isLocked, otpExpired)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking OTP status for email: {Email}", email);
                throw;
            }
        }

        private string GetOTPStatusMessage(Domain.Entities.User user, bool isLocked, bool otpExpired)
        {
            if (user.Status == Domain.Enums.UserStatus.Active)
                return "Tài khoản đã được xác thực.";

            if (isLocked)
            {
                var remainingTime = user.OTPLockoutExpiresAt!.Value.Subtract(DateTime.UtcNow);
                return $"Tài khoản đã bị khóa. Vui lòng thử lại sau {Math.Ceiling(remainingTime.TotalMinutes)} phút.";
            }

            if (otpExpired)
                return "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.";

            if (string.IsNullOrEmpty(user.OTPCode))
                return "Chưa có mã OTP. Vui lòng đăng ký tài khoản.";

            return $"Mã OTP đã được gửi. Còn lại {SecurityConstants.MaxOTPAttempts - user.OTPAttemptCount} lần thử.";
        }

        private string GenerateSecureOTP()
        {
            using var rng = RandomNumberGenerator.Create();
            var bytes = new byte[4];
            rng.GetBytes(bytes);
            
            // Convert to positive integer and get 6 digits
            var randomNumber = Math.Abs(BitConverter.ToInt32(bytes, 0));
            var otp = (randomNumber % 900000 + 100000).ToString(); // Ensures 6 digits
            
            return otp;
        }
    }
}
