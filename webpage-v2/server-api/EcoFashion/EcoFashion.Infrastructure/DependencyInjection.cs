using EcoFashion.Application.Interfaces;
using EcoFashion.Application.Common.Settings;
using EcoFashion.Application.Middlewares;
using EcoFashion.Domain.Interfaces;
using EcoFashion.Infrastructure.Data;
using EcoFashion.Infrastructure.Repositories;
using EcoFashion.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace EcoFashion.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            // Configure settings
            services.Configure<MailSettings>(configuration.GetSection("MailSettings"));

            // Add DbContext
            services.AddDbContext<EcoFashionDbContext>(opt =>
            {
                opt.UseSqlServer(configuration.GetConnectionString("SqlDbConnection"));
            });

            // Register repositories
            services.AddScoped(typeof(IRepository<,>), typeof(GenericRepository<,>));
            services.AddScoped<IUserRepository, UserRepository>();

            // Register domain services  
            services.AddScoped<IPasswordHasher, LegacyPasswordHasher>(); // Tương thích 100% với v1 (SHA256)
            services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

            // Register application services
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IEmailService, EmailService>();
            
            // Register middlewares
            services.AddScoped<ExceptionMiddleware>();
            
            // Register DatabaseInitialiser
            services.AddScoped<DatabaseInitialiser>();

            // JWT Authentication - Đơn giản hóa theo v1
            var jwtKey = configuration["JwtSettings:Key"] ?? throw new InvalidOperationException("JWT Key not configured");

            services.AddAuthentication(options =>
            {
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters()
                {
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true
                };
            });

            return services;
        }
    }
}
