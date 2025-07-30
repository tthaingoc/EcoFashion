using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoFashionBackEnd.Entities
{
    [Table("DesignsSizes")]
    public class DesignsSize
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string? SizeName { get; set; }
        public string? SizeDescription { get; set; }
        public virtual ICollection<DesignsVariant> Variants { get; set; } = new List<DesignsVariant>();
        public virtual ICollection<DesignTypeSizeRatio> TypeSizeRatios { get; set; } = new List<DesignTypeSizeRatio>();
    }
}