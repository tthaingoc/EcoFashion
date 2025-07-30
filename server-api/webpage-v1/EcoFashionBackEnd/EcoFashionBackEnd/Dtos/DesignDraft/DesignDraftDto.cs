using EcoFashionBackEnd.Entities;

namespace EcoFashionBackEnd.Dtos.DesignDraft
{
    public class DesignDraftDto
    {
        public int DesignId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public float RecycledPercentage { get; set; }
        public int DesignTypeId { get; set; }
        public DesignStage Stage { get; set; }
        public DateTime CreatedAt { get; set; }

        public List<DraftPartDto> DraftParts { get; set; }
        public List<string> SketchImageUrls { get; set; }
    }
}
