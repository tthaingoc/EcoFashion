using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoFashionBackEnd.Entities
{
    [Table("DraftParts")]
    public class DraftPart
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PartId { get; set; }

        // FK đến bản Draft (Design)
        [ForeignKey("Design")]
        public int DesignId { get; set; }
        public virtual Design Design { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty; // Tên part: "Sleeve", "Collar", v.v.

        public float Length { get; set; } // cm
        public float Width { get; set; }  // cm

        public int Quantity { get; set; }


        [ForeignKey("Material")]
        public int MaterialId { get; set; }
        public virtual Material Material { get; set; }

        public MaterialStatus MaterialStatus { get; set; } = MaterialStatus.Main;
    }

    public enum MaterialStatus
    {
        Main,   // Vật liệu chính
        Sup     // Vật liệu phụ trợ
    }
}

