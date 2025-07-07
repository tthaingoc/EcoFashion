using EcoFashion.Application.DTOs.Auth;
using EcoFashion.Application.DTOs.User;
using EcoFashion.Application.Exceptions;
using EcoFashion.Application.Interfaces;
using EcoFashion.Domain.Interfaces;
using EcoFashion.Domain.Enums;

namespace EcoFashion.Infrastructure.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;
        private readonly IEmailService _emailService;

        public UserService(
            IUserRepository userRepository,
            IPasswordHasher passwordHasher,
            IJwtTokenGenerator jwtTokenGenerator,
            IEmailService emailService)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _jwtTokenGenerator = jwtTokenGenerator;
            _emailService = emailService;
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
            // Kiểm tra email đã tồn tại chưa
            if (await _userRepository.EmailExistsAsync(request.Email))
            {
                throw new BadRequestException("Email đã được sử dụng.");
            }

            // Tạo OTP
            var otp = GenerateOTP();
            var otpExpires = DateTime.UtcNow.AddMinutes(10); // OTP hết hạn sau 10 phút

            // Tạo user mới
            var newUser = new Domain.Entities.User
            {
                Email = request.Email,
                FullName = request.fullname,
                Phone = request.Phone,
                Username = request.username,
                PasswordHash = _passwordHasher.HashPassword(request.Password),
                RoleId = 4, // Default Customer role
                Status = Domain.Enums.UserStatus.Pending,
                OTPCode = otp,
                OTPExpiresAt = otpExpires,
                CreatedAt = DateTime.UtcNow
            };

            // Lưu user
            await _userRepository.CreateAsync(newUser);

            // Gửi email OTP
            var emailResult = await _emailService.SendOTPEmailAsync(request.Email, otp);
            if (!emailResult)
            {
                throw new BadRequestException("Không thể gửi email xác thực. Vui lòng thử lại.");
            }

            return new SignupResponse
            {
                Success = true,
                Message = "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
                Email = request.Email
            };
        }

        public async Task<bool> VerifyOTPAsync(VerifyOTPRequest request)
        {
            var user = await _userRepository.GetByEmailAsync(request.Email);
            if (user == null)
            {
                throw new NotFoundException("Tài khoản không tồn tại.");
            }

            // Kiểm tra OTP
            if (user.OTPCode != request.OTPCode || user.OTPExpiresAt < DateTime.UtcNow)
            {
                throw new BadRequestException("Mã OTP không hợp lệ hoặc đã hết hạn.");
            }

            // Kích hoạt tài khoản
            user.Status = Domain.Enums.UserStatus.Active;
            user.OTPCode = null;
            user.OTPExpiresAt = null;

            await _userRepository.UpdateAsync(user);

            // Gửi email chào mừng
            await _emailService.SendWelcomeEmailAsync(user.Email!, user.FullName ?? "");

            return true;
        }

        public async Task<bool> ResendOTPAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null)
            {
                throw new NotFoundException("Tài khoản không tồn tại.");
            }

            if (user.Status == Domain.Enums.UserStatus.Active)
            {
                throw new BadRequestException("Tài khoản đã được kích hoạt.");
            }

            // Tạo OTP mới
            var otp = GenerateOTP();
            var otpExpires = DateTime.UtcNow.AddMinutes(10);

            user.OTPCode = otp;
            user.OTPExpiresAt = otpExpires;

            await _userRepository.UpdateAsync(user);

            // Gửi email OTP mới
            var emailResult = await _emailService.SendOTPEmailAsync(email, otp);
            if (!emailResult)
            {
                throw new BadRequestException("Không thể gửi email xác thực.");
            }

            return true;
        }

        private string GenerateOTP()
        {
            var random = new Random();
            return random.Next(100000, 999999).ToString(); // 6 chữ số
        }
    }
}
