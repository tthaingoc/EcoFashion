using EcoFashion.Domain.Entities;
using EcoFashion.Domain.Enums;
using EcoFashion.Infrastructure.Helpers;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EcoFashion.Infrastructure.Data
{
    public interface IDatabaseInitialiser
    {
        Task InitialiseAsync();
        Task SeedAsync();
        Task TrySeedAsync();
    }

    public class DatabaseInitialiser
    {
        public readonly EcoFashionDbContext _context;

        public DatabaseInitialiser(EcoFashionDbContext context)
        {
            _context = context;
        }

        public async Task InitialiseAsync()
        {
            try
            {
                // Migration Database - Create database if it does not exist
                await _context.Database.MigrateAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                throw;
            }
        }

        public async Task SeedAsync()
        {
            try
            {
                await TrySeedAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                throw;
            }
        }

        public async Task TrySeedAsync()
        {
            if (_context.UserRoles.Any() || _context.Users.Any()) return;


            var adminRole = new UserRole { RoleName = "Admin", Description = "System administrator" };
            var designerRole = new UserRole { RoleName = "designer", Description = "Fashion designer" };
            var supplierRole = new UserRole { RoleName = "supplier", Description = "Material supplier" };
            var customerRole = new UserRole { RoleName = "customer", Description = "Customer user" };

            await _context.UserRoles.AddRangeAsync(adminRole, designerRole, supplierRole, customerRole);
            await _context.SaveChangesAsync();


            var users = new List<User>
    {
        new User
        {
            Email = "admin@example.com",
            PasswordHash = SecurityUtil.Hash("admin"),
            FullName = "Admin User",
            RoleId = adminRole.RoleId,
            Status = UserStatus.Active
        },
        new User
        {
            Email = "designer@example.com",
            PasswordHash = SecurityUtil.Hash("designer"),
            FullName = "Designer One",
            RoleId = designerRole.RoleId,
            Status = UserStatus.Active
        },
        new User
        {
            Email = "supplier@example.com",
            PasswordHash = SecurityUtil.Hash("supplier"),
            FullName = "Supplier One",
            RoleId = supplierRole.RoleId,
            Status = UserStatus.Active
        },
        new User
        {
            Email = "customer@example.com",
            PasswordHash = SecurityUtil.Hash("customer"),
            FullName = "Customer One",
            RoleId = customerRole.RoleId,
            Status = UserStatus.Active
        }
    };

            await _context.Users.AddRangeAsync(users);
            await _context.SaveChangesAsync();


            var designerUser = await _context.Users.FirstAsync(u => u.Email == "designer@example.com");
            var supplierUser = await _context.Users.FirstAsync(u => u.Email == "supplier@example.com");


            await _context.Designers.AddAsync(new Designer
            {
                UserId = designerUser.UserId,
                DesignerName = "Designer One",
                PortfolioUrl = "https://portfolio.designer1.com",
                Email = "designer1@example.com",
                Status = "active"
            });

            await _context.Suppliers.AddAsync(new Supplier
            {
                UserId = supplierUser.UserId,
                SupplierName = "Supplier One",
                PortfolioUrl = "https://supplier1.com",
                Email = "supplier1@example.com",
                Status = "active"
            });

            await _context.SaveChangesAsync();
        }
    }

    public static class DatabaseInitialiserExtension
    {
        public static async Task InitialiseDatabaseAsync(this WebApplication app)
        {
            // Create IServiceScope to resolve service scope
            using var scope = app.Services.CreateScope();
            var initializer = scope.ServiceProvider.GetRequiredService<DatabaseInitialiser>();

            await initializer.InitialiseAsync();

            // Try to seeding data
            await initializer.SeedAsync();
        }
    }
}

