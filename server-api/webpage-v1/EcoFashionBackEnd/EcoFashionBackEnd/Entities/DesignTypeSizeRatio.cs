using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoFashionBackEnd.Entities
{

    [Table("DesignTypeSizeRatios")]
    public class DesignTypeSizeRatio
    {
        [Key]
        public int Id { get; set; }

        public int DesignTypeId { get; set; }
        [ForeignKey(nameof(DesignTypeId))]
        public virtual DesignsType DesignType { get; set; }

        public int SizeId { get; set; }
        [ForeignKey(nameof(SizeId))]
        public virtual DesignsSize Size { get; set; }

        // Hệ số áp dụng theo size cho loại thiết kế
        public float Ratio { get; set; }
    }
}