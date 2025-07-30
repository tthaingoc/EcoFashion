namespace EcoFashionBackEnd.Dtos.Design
{
    public class VariantDto
    {
       
        public string SizeName { get; set; }
        public string ColorName { get; set; }
        public string ColorCode { get; set; }
        public int Quantity { get; set; }
        public float CarbonFootprint { get; set; }
        public float WaterUsage { get; set; }
        public float WasteDiverted { get; set; }
    }
}
