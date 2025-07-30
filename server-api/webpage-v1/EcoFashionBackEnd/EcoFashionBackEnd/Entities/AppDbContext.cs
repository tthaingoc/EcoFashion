using EcoFashionBackEnd.Entities.EcoFashionBackEnd.Entities;
using Microsoft.EntityFrameworkCore;

namespace EcoFashionBackEnd.Entities
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        #region DbSet

        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<Designer> Designers { get; set; }
        public DbSet<Application> Applications { get; set; }
        public DbSet<SavedSupplier> SavedSuppliers { get; set; }
        public DbSet<Design> Designs { get; set; }
        public DbSet<DesignsVariant> DesignsVarients { get; set; }
        public DbSet<DesignsMaterial> DesignsMaterials { get; set; }
        public DbSet<DesignsColor> DesignsColors { get; set; }
        public DbSet<DesignImage> DesignImages { get; set; }
        public DbSet<Image> Images { get; set; }
        public DbSet<DesignTypeSizeRatio> TypeSizes { get; set; }
        public DbSet<DesignFeature> DesignFeatures { get; set; }
        public DbSet<DesignsSize> DesignsSizes { get; set; }
        public DbSet<DesignsType> DesignsTypes { get; set; }
        public DbSet<DesignerMaterialInventory> DesignerMaterialInventories { get; set; }
        public DbSet<Material> Materials { get; set; }
        public DbSet<MaterialImage> MaterialImages { get; set; }
        public DbSet<SustainabilityCriteria> SustainabilityCriterias { get; set; }
        public DbSet<MaterialSustainability> MaterialSustainabilities { get; set; }
        public DbSet<MaterialType> MaterialTypes { get; set; }
        public DbSet<MaterialTypeBenchmark> MaterialTypesBenchmarks { get; set; }
        #endregion

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasOne(u => u.UserRole)
                .WithMany()
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);
            #region user

            // SUPPLIER PROFILE
            modelBuilder.Entity<Supplier>()
                .HasOne(sp => sp.User)
                .WithMany()
                .HasForeignKey(sp => sp.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // DESIGNER PROFILE
            modelBuilder.Entity<Designer>()
                .HasOne(dp => dp.User)
                .WithMany()
                .HasForeignKey(dp => dp.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // APPLICATION
            modelBuilder.Entity<Application>()
                .HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Application>()
                .HasOne(a => a.Role)
                .WithMany()
                .HasForeignKey(a => a.TargetRoleId)
                .OnDelete(DeleteBehavior.Restrict);


            // SAVED SUPPLIER
            modelBuilder.Entity<SavedSupplier>()
                .HasOne(ss => ss.Designer)
                .WithMany()
                .HasForeignKey(ss => ss.DesignerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SavedSupplier>()
                .HasOne(ss => ss.Supplier)
                .WithMany()
                .HasForeignKey(ss => ss.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<User>()
             .Property(u => u.Status)
             .HasConversion<string>();

            modelBuilder.Entity<Application>()
                .Property(a => a.Status)
                .HasConversion<string>();
            #endregion
            #region DESIGN
            modelBuilder.Entity<DesignsColor>()
                .HasMany(c => c.Variants)
                .WithOne(v => v.DesignsColor)
                .HasForeignKey(v => v.ColorId)
                .OnDelete(DeleteBehavior.Restrict); 

            modelBuilder.Entity<DesignsSize>()
                .HasMany(s => s.Variants)
                .WithOne(v => v.DesignsSize)
                .HasForeignKey(v => v.SizeId)
                .OnDelete(DeleteBehavior.Restrict); 

            modelBuilder.Entity<DesignsVariant>()
                .HasOne(v => v.Design)
                .WithMany(d => d.DesignsVariants)
                .HasForeignKey(v => v.DesignId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<DesignsVariant>()
                .HasIndex(v => new { v.DesignId, v.SizeId, v.ColorId })
                .IsUnique(); 

            modelBuilder.Entity<DesignsMaterial>()
                .HasKey(dm => new { dm.DesignId, dm.MaterialId });

            modelBuilder.Entity<DesignsMaterial>()
                .HasOne(dm => dm.Designs)
                .WithMany(d => d.DesignsMaterials)
                .HasForeignKey(dm => dm.DesignId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DesignsMaterial>()
                .HasOne(dm => dm.Materials)
                .WithMany()
                .HasForeignKey(dm => dm.MaterialId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DesignFeature>()
                .HasOne(df => df.Design)
                .WithOne(d => d.DesignsFeature)
                .HasForeignKey<DesignFeature>(df => df.DesignId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DesignImage>()
                .HasOne(di => di.Design)
                .WithMany(d => d.DesignImages)
                .HasForeignKey(di => di.DesignId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DesignImage>()
                .HasOne(di => di.Image)
                .WithMany()
                .HasForeignKey(di => di.ImageId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DesignImage>()
                .HasIndex(di => new { di.DesignId, di.ImageId })
                .IsUnique();

            modelBuilder.Entity<Design>()
                .HasOne(d => d.DesignTypes)
                .WithMany()
                .HasForeignKey(d => d.DesignTypeId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Design>()
                .Property(d => d.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<DesignTypeSizeRatio>()
                 .HasOne(x => x.DesignType)
                 .WithMany(dt => dt.TypeSizeRatios)
                 .HasForeignKey(x => x.DesignTypeId)
                 .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DesignTypeSizeRatio>()
                .HasOne(x => x.Size)
                .WithMany(sz => sz.TypeSizeRatios)
                .HasForeignKey(x => x.SizeId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique constraint: 1 cặp (DesignTypeId, SizeId) chỉ có 1 hệ số
            modelBuilder.Entity<DesignTypeSizeRatio>()
                .HasIndex(x => new { x.DesignTypeId, x.SizeId })
                .IsUnique();
            // ------------------ DRAFT PART ------------------
            modelBuilder.Entity<DraftPart>()
                .HasOne(dp => dp.Design)
                .WithMany(d => d.DraftParts)
                .HasForeignKey(dp => dp.DesignId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DraftPart>()
                .HasOne(dp => dp.Material)
                .WithMany()
                .HasForeignKey(dp => dp.MaterialId)
                .OnDelete(DeleteBehavior.Restrict); // không xoá Material nếu xoá Part

            // ------------------ DRAFT SKETCH ------------------
            modelBuilder.Entity<DraftSketch>()
                .HasOne(ds => ds.Design)
                .WithMany(d => d.DraftSketches)
                .HasForeignKey(ds => ds.DesignId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DraftSketch>()
                .HasOne(ds => ds.Image)
                .WithMany()
                .HasForeignKey(ds => ds.ImageId)
                .OnDelete(DeleteBehavior.Cascade);

            // Optional: đảm bảo 1 ảnh sketch không bị trùng với cùng 1 design
            modelBuilder.Entity<DraftSketch>()
                .HasIndex(ds => new { ds.DesignId, ds.ImageId })
                .IsUnique();

            modelBuilder.Entity<DraftPart>()
                .Property(dp => dp.MaterialStatus)
                .HasConversion<string>();

            modelBuilder.Entity<Design>()
                .Property(d => d.Stage)
                .HasConversion<string>();


            #endregion

            #region Material 
            // Configure relationships for Materials
            modelBuilder.Entity<Material>()
                .HasOne(m => m.Supplier)
                .WithMany()
                .HasForeignKey(m => m.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Material>()
                .HasOne(m => m.MaterialType)
                .WithMany()
                .HasForeignKey(m => m.TypeId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Material>()
                .Property(m => m.PricePerUnit)
                .HasPrecision(18, 2);
            modelBuilder.Entity<Material>()
                .Property(m => m.RecycledPercentage)
                .HasPrecision(5, 2);

            modelBuilder.Entity<MaterialImage>()
                .HasOne(mi => mi.Material)
                .WithMany(m => m.MaterialImages)
                .HasForeignKey(mi => mi.MaterialId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<MaterialImage>()
                .HasOne(mi => mi.Image)
                .WithMany()
                .HasForeignKey(mi => mi.ImageId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<MaterialSustainability>()
                .HasKey(ms => new { ms.MaterialId, ms.CriterionId });

            modelBuilder.Entity<MaterialSustainability>()
                .HasOne(ms => ms.Material)
                .WithMany(m => m.MaterialSustainabilityMetrics)
                .HasForeignKey(ms => ms.MaterialId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<MaterialSustainability>()
                .HasOne(ms => ms.SustainabilityCriterion)
                .WithMany()
                .HasForeignKey(ms => ms.CriterionId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<MaterialSustainability>()
                .Property(ms => ms.Value)
                .HasPrecision(18, 2);

            modelBuilder.Entity<DesignerMaterialInventory>()
                .HasOne(dmi => dmi.Designer)
                .WithMany()
                .HasForeignKey(dmi => dmi.DesignerId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<DesignerMaterialInventory>()
                .HasOne(dmi => dmi.Material)
                .WithMany()
                .HasForeignKey(dmi => dmi.MaterialId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<DesignerMaterialInventory>()
                .Property(dmi => dmi.Cost)
                .HasPrecision(18, 2);

            modelBuilder.Entity<MaterialTypeBenchmark>()
                .HasOne(mt => mt.MaterialType)
                .WithMany()
                .HasForeignKey(mt => mt.TypeId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<MaterialTypeBenchmark>()
                .HasOne(mt => mt.SustainabilityCriteria)
                .WithMany()
                .HasForeignKey(mt => mt.CriteriaId)
                .OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<MaterialTypeBenchmark>()
                .Property(mt => mt.Value)
                .HasPrecision(18, 2);
            #endregion
            #region unique


           
            #endregion

        }
    }
}