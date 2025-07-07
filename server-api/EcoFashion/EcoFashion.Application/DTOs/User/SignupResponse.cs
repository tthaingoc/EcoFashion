using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EcoFashion.Application.DTOs.User;

public class SignupResponse
{
     public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
}
