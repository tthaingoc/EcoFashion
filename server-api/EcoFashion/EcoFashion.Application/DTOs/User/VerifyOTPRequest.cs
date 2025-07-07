using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EcoFashion.Application.DTOs.User;

public class VerifyOTPRequest
{
     public string Email { get; set; } = string.Empty;
    public string OTPCode { get; set; } = string.Empty;
}
