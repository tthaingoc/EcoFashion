using EcoFashionBackEnd.Entities;
using Microsoft.EntityFrameworkCore;

namespace EcoFashionBackEnd.Data.test
{
    public static class DesignsTypeSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (await context.DesignsTypes.AnyAsync()) return;

            var types = new List<DesignsType>
        {
           
            new DesignsType { DesignName = "Áo" },
            new DesignsType { DesignName = "Quần" },
            new DesignsType { DesignName = "Đầm" },
            new DesignsType { DesignName = "Váy" }
        };

            await context.DesignsTypes.AddRangeAsync(types);
            await context.SaveChangesAsync();
        }
    }

}