﻿using EcoFashion.Application.Common;
using EcoFashion.Application.DTOs.Auth;
using EcoFashion.Application.DTOs.User;
using EcoFashion.Application.Exceptions;
using EcoFashion.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcoFashion.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
     public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResult<object>.Fail("Dữ liệu không hợp lệ."));

            try
            {
                // Gọi service để xác thực user
                var result = await _userService.LoginAsync(request);
                return Ok(ApiResult<AuthResponse>.Succeed(result));
            }
            catch (BadRequestException ex)
            {
                return BadRequest(ApiResult<object>.Fail(ex.Message));
            }
            catch (UserNotFoundException ex)
            {
                return NotFound(ApiResult<object>.Fail(ex.Message));
            }
            catch (Exception ex)
            {
                // Log exception
                return StatusCode(500, ApiResult<object>.Fail(ex.Message));
            }
        }

        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] SignupRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResult<object>.Fail("Dữ liệu không hợp lệ."));

            try
            {
                var result = await _userService.SignupAsync(request);
                return Ok(ApiResult<SignupResponse>.Succeed(result));
            }
            catch (BadRequestException ex)
            {
                return BadRequest(ApiResult<object>.Fail(ex.Message));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResult<object>.Fail("Đã có lỗi xảy ra. Vui lòng thử lại sau."));
            }
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOTP([FromBody] VerifyOTPRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResult<object>.Fail("Dữ liệu không hợp lệ."));

            try
            {
                var result = await _userService.VerifyOTPAsync(request);
                if (result)
                {
                    return Ok(ApiResult<object>.Succeed("Xác thực OTP thành công. Tài khoản đã được kích hoạt."));
                }
                return BadRequest(ApiResult<object>.Fail("Xác thực OTP thất bại."));
            }
            catch (BadRequestException ex)
            {
                return BadRequest(ApiResult<object>.Fail(ex.Message));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResult<object>.Fail("Đã có lỗi xảy ra. Vui lòng thử lại sau."));
            }
        }

        [HttpPost("resend-otp")]
        public async Task<IActionResult> ResendOTP([FromBody] ResendOTPRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ApiResult<object>.Fail("Dữ liệu không hợp lệ."));

            try
            {
                var result = await _userService.ResendOTPAsync(request.Email);
                if (result)
                {
                    return Ok(ApiResult<object>.Succeed("Mã OTP đã được gửi lại thành công."));
                }
                return BadRequest(ApiResult<object>.Fail("Không thể gửi lại mã OTP."));
            }
            catch (BadRequestException ex)
            {
                return BadRequest(ApiResult<object>.Fail(ex.Message));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResult<object>.Fail("Đã có lỗi xảy ra. Vui lòng thử lại sau."));
            }
        }

        [HttpGet("otp-status")]
        public async Task<IActionResult> GetOTPStatus([FromQuery] string email)
        {
            if (string.IsNullOrEmpty(email))
                return BadRequest(ApiResult<object>.Fail("Email là bắt buộc."));

            try
            {
                var result = await _userService.GetOTPStatusAsync(email);
                return Ok(ApiResult<OTPStatusResponse>.Succeed(result));
            }
            catch (BadRequestException ex)
            {
                return BadRequest(ApiResult<object>.Fail(ex.Message));
            }
            catch (Exception)
            {
                return StatusCode(500, ApiResult<object>.Fail("Đã có lỗi xảy ra. Vui lòng thử lại sau."));
            }
        }
    }
}
