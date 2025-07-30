using EcoFashionBackEnd.Entities;
using EcoFashionBackEnd.Seeders;
using Microsoft.EntityFrameworkCore;

namespace EcoFashionBackEnd.Data.test
{
    public interface IDatabaseInitialiser
    {
        Task InitialiseAsync();
        Task SeedAsync();
        Task TrySeedAsync();
    }
    public class DatabaseInitialiser : IDatabaseInitialiser
    {
        private readonly AppDbContext _context;

        public DatabaseInitialiser(AppDbContext context)
        {
            _context = context;
        }

        public async Task InitialiseAsync()
        {
            try
            {
                Console.WriteLine("Starting database migration...");
                await _context.Database.MigrateAsync();
                Console.WriteLine("Database migration completed successfully!");
            }
            catch (Exception ex)
            {
                Console.WriteLine("Migration error: " + ex.Message);
                throw;
            }
        }

        public async Task SeedAsync()
        {
            // This method is intentionally empty
            Console.WriteLine("SeedAsync called (empty method)");
        }

        public async Task TrySeedAsync()
        {
            try
            {
                Console.WriteLine("Starting database seeding...");
                
                Console.WriteLine("Seeding Roles...");
                await RoleSeeder.SeedAsync(_context);
                
                Console.WriteLine("Seeding Users...");
                await UserSeeder.SeedAsync(_context);
                
                Console.WriteLine("Seeding Applications...");
                await ApplicationSeeder.SeedAsync(_context);
                
                Console.WriteLine("Seeding Designers...");
                await DesignerSeeder.SeedAsync(_context);
                
                Console.WriteLine("Seeding Suppliers...");
                await SupplierSeeder.SeedAsync(_context);
                
                Console.WriteLine("Seeding Material Types...");
                await MaterialTypeSeeder.SeedAsync(_context);
                
                Console.WriteLine("Seeding Sustainability Criteria...");
                await SustainabilityCriteriaSeeder.SeedAsync(_context);
                
                Console.WriteLine("Seeding Material Type Benchmarks...");
                await MaterialTypeBenchmarkSeeder.SeedAsync(_context);
                
                Console.WriteLine("Seeding Materials...");
                await MaterialSeeder.SeedAsync(_context);
                
                Console.WriteLine("Seeding Material Sustainability...");
                await MaterialSustainabilitySeeder.SeedAsync(_context);
                
                Console.WriteLine("Seeding Material Images...");
                await MaterialImageSeeder.SeedAsync(_context);
                
                Console.WriteLine("Seeding Design Colors...");
                await DesignColorSeeder.SeedAsync(_context);
                
                Console.WriteLine("Seeding Design Sizes...");
                await DesignsSizeSeeder.SeedAsync(_context);
                
                Console.WriteLine("Seeding Design Types...");
                await DesignsTypeSeeder.SeedAsync(_context);
                
                Console.WriteLine("Seeding Designs...");
                await DesignSeeder.SeedAsync(_context);
                
                Console.WriteLine("Seeding Design Materials...");
                await DesignMaterialSeeder.SeedAsync(_context);
                
                Console.WriteLine("Seeding Design Images...");
                await DesignImageSeeder.SeedAsync(_context);
                
                Console.WriteLine("Seeding Design Type Size Ratios...");
                await DesignTypeSizeRatioSeeder.SeedAsync(_context);
                
                Console.WriteLine("Seeding Designer Material Inventory...");
                await DesignerMaterialInventorySeeder.SeedAsync(_context);
                
                Console.WriteLine("Database seeding completed successfully!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Seed error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }
       
    }
        public static class DatabaseInitialiserExtension
        {
            public static async Task InitialiseDatabaseAsync(this WebApplication app)
            {
                using var scope = app.Services.CreateScope();
                var initializer = scope.ServiceProvider.GetRequiredService<IDatabaseInitialiser>();
                
                Console.WriteLine("Initializing database...");
                await initializer.InitialiseAsync();
                
                Console.WriteLine("Seeding database...");
                await initializer.TrySeedAsync();
            }
        }
    }
