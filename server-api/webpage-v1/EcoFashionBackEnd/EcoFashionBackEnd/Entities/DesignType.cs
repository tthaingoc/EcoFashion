    using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoFashionBackEnd.Entities
{
    [Table("DesignsTypes")]
    public class DesignsType
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int DesignTypeId { get; set; }

        public string DesignName { get; set; }
        public virtual ICollection<DesignTypeSizeRatio> TypeSizeRatios { get; set; } = new List<DesignTypeSizeRatio>();
    }
}