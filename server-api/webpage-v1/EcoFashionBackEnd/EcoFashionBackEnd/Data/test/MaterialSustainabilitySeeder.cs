using EcoFashionBackEnd.Entities;
using Microsoft.EntityFrameworkCore;

namespace EcoFashionBackEnd.Data.test
{
    public static class MaterialSustainabilitySeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (context.MaterialSustainabilities.Any())
                return;

            // Lấy tất cả materials
            var materials = await context.Materials.ToListAsync();
            if (!materials.Any())
                throw new Exception("No materials found. Please run MaterialSeeder first.");

            var materialSustainabilities = new List<MaterialSustainability>();

            foreach (var material in materials)
            {
                // Carbon Footprint (CriterionId = 1)
                if (material.CarbonFootprint.HasValue)
                {
                    materialSustainabilities.Add(new MaterialSustainability
                    {
                        MaterialId = material.MaterialId,
                        CriterionId = 1,
                        Value = material.CarbonFootprint.Value
                    });
                }

                // Water Usage (CriterionId = 2)
                if (material.WaterUsage.HasValue)
                {
                    materialSustainabilities.Add(new MaterialSustainability
                    {
                        MaterialId = material.MaterialId,
                        CriterionId = 2,
                        Value = material.WaterUsage.Value
                    });
                }

                // Waste Diverted (CriterionId = 3)
                if (material.WasteDiverted.HasValue)
                {
                    materialSustainabilities.Add(new MaterialSustainability
                    {
                        MaterialId = material.MaterialId,
                        CriterionId = 3,
                        Value = material.WasteDiverted.Value
                    });
                }

                // Organic Certification (CriterionId = 4)
                // Kiểm tra xem material có organic certification không
                var hasOrganicCert = material.CertificationDetails?.Contains("GOTS") == true || 
                                   material.CertificationDetails?.Contains("Organic") == true;
                materialSustainabilities.Add(new MaterialSustainability
                {
                    MaterialId = material.MaterialId,
                    CriterionId = 4,
                    Value = hasOrganicCert ? 1m : 0m
                });

                // Recycled Content (CriterionId = 5)
                materialSustainabilities.Add(new MaterialSustainability
                {
                    MaterialId = material.MaterialId,
                    CriterionId = 5,
                    Value = material.RecycledPercentage
                });
            }

            await context.MaterialSustainabilities.AddRangeAsync(materialSustainabilities);
            await context.SaveChangesAsync();
        }
    }
}
