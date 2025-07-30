// using EcoFashionBackEnd.Entities;
// using Microsoft.EntityFrameworkCore;

// public static class SustainableCriteriaSeeder
// {
//     public static async Task SeedAsync(AppDbContext context)
//     {
//         if (await context.SustainabilityCriterias.AnyAsync()) return;

//         var criterias = new List<SustainabilityCriteria>
//         {
//             new SustainabilityCriteria
//             {
//                 Name = "Carbon Footprint",
//                 Description = "Lower carbon footprint than conventional methods.",
//                 Unit = "kg"
//             },
//             new SustainabilityCriteria
//             {
//                 Name = "Water Usage",
//                 Description = "Compared to conventional production.",
//                 Unit = "liters"
//             },
//             new SustainabilityCriteria
//             {
//                 Name = "Waste Diverted",
//                 Description = "Textile waste kept out of landfills.",
//                 Unit = "kg"
//             },
           
//         };

//         await context.SustainabilityCriterias.AddRangeAsync(criterias);
//         await context.SaveChangesAsync();
//     }
// }
