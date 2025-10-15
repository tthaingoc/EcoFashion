using EcoFashion.Domain.Entities;
using Microsoft.EntityFrameworkCore;
// using EcoFashion.Domain.Entities; // Sẽ uncomment khi có entities

namespace EcoFashion.Infrastructure.Data
{
    public class EcoFashionDbContext : DbContext
    {
        public EcoFashionDbContext(DbContextOptions<EcoFashionDbContext> options) : base(options)
        {
        }

        // DbSets sẽ được thêm khi có entities
        #region DbSet

        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Designer> Designers { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }

        #endregion


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User entity configuration
            modelBuilder.Entity<User>()
                .HasOne(u => u.UserRole)
                .WithMany()
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            // Designer entity configuration
            modelBuilder.Entity<Designer>()
                .HasOne(d => d.User)
                .WithMany()
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Supplier entity configuration
            modelBuilder.Entity<Supplier>()
                .HasOne(s => s.User)
                .WithMany()
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
