using EcoFashionBackEnd.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace EcoFashionBackEnd.Data.test
{
    public static class SupplierSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (await context.Suppliers.AnyAsync()) return;

            // Tạo 1 user cho Supplier One
            var supplierUser = new User
            {
                Email = "supplier@example.com",
                Username = "supplier",
                PasswordHash = "hashed_password_supplier",
                FullName = "Supplier One",
                RoleId = 2, // supplier role
                Status = UserStatus.Active,
                CreatedAt = DateTime.UtcNow,
                LastUpdatedAt = DateTime.UtcNow
            };

            await context.Users.AddAsync(supplierUser);
            await context.SaveChangesAsync();

            var now = DateTime.UtcNow;

            // Tạo 1 Supplier One duy nhất
            var supplier = new Supplier
            {
                UserId = supplierUser.UserId,
                SupplierName = "Supplier One",
                Bio = "Chuyên cung cấp các loại vải bền vững chất lượng cao. Chúng tôi cam kết cung cấp các loại vải thân thiện môi trường với giá cả hợp lý.",
                AvatarUrl = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
                BannerUrl = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
                PortfolioUrl = "https://supplier-one.com",
                PortfolioFiles = JsonSerializer.Serialize(new[]
                {
                    "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=400",
                    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
                    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400"
                }),
                Certificates = JsonSerializer.Serialize(new[]
                {
                    "GOTS Certified",
                    "GRS Certified", 
                    "OEKO-TEX Standard 100",
                    "EU Ecolabel"
                }),
                Email = "contact@supplier-one.com",
                PhoneNumber = "0987654321",
                Address = "123 Supplier Street, District 1, Ho Chi Minh City",
                TaxNumber = "TAXSUP001",
                IdentificationNumber = "SUPID987654321",
                SpecializationUrl = "https://supplier-one.com/specialization",
                Status = "active",
                Rating = 4.8,
                ReviewCount = 156,
                CreatedAt = now,
                UpdatedAt = now
            };

            await context.Suppliers.AddAsync(supplier);
            await context.SaveChangesAsync();
        }
    }
}