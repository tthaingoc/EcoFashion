namespace EcoFashionBackEnd.Dtos
{
    public class InventoryTransactionDto
    {
        public int TransactionId { get; set; }
        public int InventoryId { get; set; }
        public int? PerformedByUserId { get; set; }
        public decimal? QuantityChanged { get; set; }
        public decimal? BeforeQty { get; set; }
        public decimal? AfterQty { get; set; }
        public DateTime TransactionDate { get; set; }
        public string TransactionType { get; set; }
        public string Notes { get; set; }
        public string InventoryType { get; set; } // Phân biệt loại: "Product" hoặc "Material"
    }
}
