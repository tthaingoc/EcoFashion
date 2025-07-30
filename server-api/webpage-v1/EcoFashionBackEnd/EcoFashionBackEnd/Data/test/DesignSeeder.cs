using EcoFashionBackEnd.Entities;
using Humanizer;
using Microsoft.EntityFrameworkCore;
using System;

namespace EcoFashionBackEnd.Data.test
{
    public static class DesignSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            var designNames = new[]
            {
            "Eco Hoodie", "Organic T-Shirt", "Sustainable Jeans", "Linen Blouse",
            "Recycled Jacket", "Eco Dress", "Vegan Leather Bag", "Bamboo Shirt",
            "RPET Shorts", "Hemp Hat", "Green Socks", "Bio Cotton Skirt"
        };

            if (await context.Designs.AnyAsync()) return;

            var designer = await context.Designers
                .Include(d => d.User) // đảm bảo lấy được User.Email
                .FirstOrDefaultAsync(d => d.User.Email == "designer@example.com");

            if (designer == null) throw new Exception("Designer not found");

            var designs = new List<Design>();
            var random = new Random();
            int min = 500_000;
            int max = 1_000_000;

            for (int i = 0; i < designNames.Length; i++)
            {
                var design = new Design
                {
                    Name = designNames[i],
                    Description = $"This is a sustainable design: {designNames[i]}",
                    DesignerId = designer.DesignerId,
                    RecycledPercentage = 100 - i, // giảm dần cho đa dạng
                    CareInstructions = $"{designNames[i]} phải giặt bằng nước, ít xài hóa chất",
                    Price = random.Next(min, max + 1),
                    ProductScore = 5,
                    Status = "in stock",
                    DesignTypeId = 1, 
                    Stage = DesignStage.Finalized,
                    CreatedAt = DateTime.UtcNow
                };

                designs.Add(design);
            }

            await context.Designs.AddRangeAsync(designs);
            await context.SaveChangesAsync();
        }
    }

}

//phần này cho khi dùng 3 designer  
//if (await context.Designs.AnyAsync()) return;

//var designers = await context.Designers
//    .OrderBy(d => d.DesignerId)
//    .Take(3)
//    .ToListAsync();

//if (designers.Count < 3)
//    throw new Exception("Need at least 3 designers to seed with this method.");
//var designs = new List<Design>();
//int designerIndex = 0;

//for (int i = 0; i < 12; i++)
//{
//    designs.Add(new Design
//    {
//        Name = designNames[i],
//        Description = $"This is a sustainable design: {designNames[i]}",
//        DesignerId = designers[designerIndex].DesignerId,
//        CreatedAt = DateTime.UtcNow
//    });

//    // Mỗi 4 thiết kế thì đổi designer
//    if ((i + 1) % 4 == 0) designerIndex++;
//}