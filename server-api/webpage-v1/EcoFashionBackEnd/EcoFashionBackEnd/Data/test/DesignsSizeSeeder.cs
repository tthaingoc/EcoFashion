using EcoFashionBackEnd.Entities;
using Microsoft.EntityFrameworkCore;

namespace EcoFashionBackEnd.Data
{
    public static class DesignsSizeSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (await context.DesignsSizes.AnyAsync()) return;

            var sizes = new List<DesignsSize>
            {
                new DesignsSize { SizeName = "S", SizeDescription = "Small" },
                new DesignsSize { SizeName = "M", SizeDescription = "Medium" },
                new DesignsSize { SizeName = "L", SizeDescription = "Large" },
                new DesignsSize { SizeName = "XL", SizeDescription = "Extra Large" },
              
            };

            await context.DesignsSizes.AddRangeAsync(sizes);
            await context.SaveChangesAsync();
        }
    }
}