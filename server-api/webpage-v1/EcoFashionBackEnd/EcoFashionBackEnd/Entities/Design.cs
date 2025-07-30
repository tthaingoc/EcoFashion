using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace EcoFashionBackEnd.Entities
{
    [Table("Designs")]
    public class Design
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int DesignId { get; set; }

        [ForeignKey("DesignerProfile")]
        public Guid DesignerId { get; set; }
        public virtual Designer DesignerProfile { get; set; }

        public string? Name { get; set; }
        public string? Description { get; set; }

        public float RecycledPercentage { get; set; }
        public string? CareInstructions { get; set; }

        public decimal Price { get; set; }
        public int ProductScore { get; set; }
        public string? Status { get; set; }
        public DesignStage Stage { get; set; } = DesignStage.Draft;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("DesignsTypes")]
        public int? DesignTypeId { get; set; }

        public virtual DesignsType DesignTypes { get; set; }
        public virtual ICollection<DesignsVariant> DesignsVariants { get; set; } = new List<DesignsVariant>();
        public virtual DesignFeature DesignsFeature { get; set; }
        public virtual ICollection<DesignsMaterial> DesignsMaterials { get; set; } = new List<DesignsMaterial>();

        public virtual ICollection<DesignsRating> DesignsRatings { get; set; } = new List<DesignsRating>();
        public virtual ICollection<DesignImage> DesignImages { get; set; } = new List<DesignImage>();

        public virtual ICollection<DraftSketch> DraftSketches { get; set; } = new List<DraftSketch>();

        public virtual ICollection<DraftPart> DraftParts { get; set; } = new List<DraftPart>();
    }
    public enum DesignStage
    {
        Draft,
        InProgress,
        Finalized,
        Archived
    }
}
