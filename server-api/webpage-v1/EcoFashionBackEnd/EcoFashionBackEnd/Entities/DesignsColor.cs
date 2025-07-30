using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoFashionBackEnd.Entities
{
    [Table("DesignsColors")]
    public class DesignsColor
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string? ColorName { get; set; }
        public string? ColorCode { get; set; }
        public virtual ICollection<DesignsVariant> Variants { get; set; }
    }
}