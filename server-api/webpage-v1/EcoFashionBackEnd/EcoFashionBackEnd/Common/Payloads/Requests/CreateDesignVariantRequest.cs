namespace EcoFashionBackEnd.Common.Payloads.Requests
{
    public class CreateDesignVariantRequest
    {
        public int DesignId { get; set; }
        public int SizeId { get; set; }
        public int ColorId { get; set; }
        public int Quantity { get; set; }

        public float CarbonFootprint { get; set; }
        public float WaterUsage { get; set; }
        public float WasteDiverted { get; set; }
    }

}
