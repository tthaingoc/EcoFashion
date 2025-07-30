using EcoFashionBackEnd.Entities;
using Microsoft.EntityFrameworkCore;

namespace EcoFashionBackEnd.Data.test
{
    public static class DesignTypeSizeRatioSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (await context.TypeSizes.AnyAsync()) return;

            var designTypes = await context.DesignsTypes.ToListAsync();
            var sizes = await context.DesignsSizes.ToListAsync();

            var ratios = new List<DesignTypeSizeRatio>();

            foreach (var type in designTypes)
            {
                foreach (var size in sizes)
                {
                    float ratio = GetRatioForTypeAndSize(type.DesignName.ToLower(), size.SizeName.ToUpper());
                    ratios.Add(new DesignTypeSizeRatio
                    {
                        DesignTypeId = type.DesignTypeId,
                        SizeId = size.Id,
                        Ratio = ratio
                    });
                }
            }

            await context.TypeSizes.AddRangeAsync(ratios);
            await context.SaveChangesAsync();
        }

        private static float GetRatioForTypeAndSize(string typeName, string size)
        {
            // Mặc định hệ số theo size cho từng loại
            float baseRatio = size switch
            {
                "S" => 0.8f,
                "M" => 1.0f,
                "L" => 1.2f,
                "XL" => 1.4f,
                _ => 1.0f
            };

            // Điều chỉnh tùy theo loại thiết kế
            return typeName switch
            {
                "áo" => baseRatio, // chuẩn
                "quần" => baseRatio * 1.1f, // cần thêm vải ở phần chân
                "đầm" => baseRatio * 1.3f, // nhiều vải hơn
                "váy" => baseRatio * 1.2f, // trung bình
                _ => baseRatio
            };
        }
    }

}
