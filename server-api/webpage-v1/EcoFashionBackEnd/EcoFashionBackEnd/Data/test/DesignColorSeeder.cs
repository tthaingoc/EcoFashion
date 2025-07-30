using EcoFashionBackEnd.Entities;
using Microsoft.EntityFrameworkCore;

namespace EcoFashionBackEnd.Seeders
{
    public static class DesignColorSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (await context.DesignsColors.AnyAsync()) return;

            var colors = new List<DesignsColor>
            {
                new DesignsColor { ColorName = "Đen", ColorCode = "#000000" },
                new DesignsColor { ColorName = "Trắng", ColorCode = "#FFFFFF" },
                new DesignsColor { ColorName = "Xanh lá", ColorCode = "#2ECC40" },
                new DesignsColor { ColorName = "Nâu", ColorCode = "#8B4513" },
                new DesignsColor { ColorName = "Xanh Navy", ColorCode = "#001F3F" },
                new DesignsColor { ColorName = "Xanh Rêu", ColorCode = "#556B2F" },
                new DesignsColor { ColorName = "Xám", ColorCode = "#808080" },
                new DesignsColor { ColorName = "Be", ColorCode = "#F5F5DC" },
                new DesignsColor { ColorName = "Tím", ColorCode = "#800080" },
                new DesignsColor { ColorName = "Hồng", ColorCode = "#FF69B4" },
                new DesignsColor { ColorName = "Hồng Nhạt", ColorCode = "#FFE4E1" },
                new DesignsColor { ColorName = "Kem", ColorCode = "#FDF5E6" },
                new DesignsColor { ColorName = "Xanh Nhạt", ColorCode = "#ADD8E6" },
                new DesignsColor { ColorName = "Xanh Dương", ColorCode = "#0074D9" },
                new DesignsColor { ColorName = "Xanh Đậm", ColorCode = "#003366" },
                new DesignsColor { ColorName = "Forest Green", ColorCode = "#228B22" },
                new DesignsColor { ColorName = "Ocean Blue", ColorCode = "#1E90FF" },
                new DesignsColor { ColorName = "Sunset Orange", ColorCode = "#FF4500" },
                new DesignsColor { ColorName = "Earth Brown", ColorCode = "#8B4513" }
            };

            await context.DesignsColors.AddRangeAsync(colors);
            await context.SaveChangesAsync();
        }
    }
}
