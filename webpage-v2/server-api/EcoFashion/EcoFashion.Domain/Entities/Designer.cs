using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace EcoFashion.Domain.Entities;

    [Table("Designer")]
    public class Designer
    {
        [Key]
        public Guid DesignerId { get; set; } = Guid.NewGuid();

        [ForeignKey("User")]
        public int UserId { get; set; }
        public User? User { get; set; }

        [StringLength(100)]
        public string? DesignerName { get; set; }

        public string? PortfolioUrl { get; set; }
        public string? BannerUrl { get; set; }
        public string? SpecializationUrl { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? TaxNumber { get; set; }
        public string? IdentificationNumber { get; set; }
        public string? IdentificationPicture { get; set; }
        public string? IdentificationPictureOwner { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public string? Status { get; set; }
    }