namespace EcoFashionBackEnd.Dtos.Design
{
    public class MaterialDto
    {
        public int MaterialId { get; set; }
        public double PersentageUsed { get; set; }
        public double MeterUsed { get; set; }
        public string? MaterialDescription { get; set; }

        public string? MaterialName { get; set; }
        public string? MaterialTypeName { get; set; }
        public List<SustainabilityCriterionDto> SustainabilityCriteria { get; set; } = new();
    }
}
