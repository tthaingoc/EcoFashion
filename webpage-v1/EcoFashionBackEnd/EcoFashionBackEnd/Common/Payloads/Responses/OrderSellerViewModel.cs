namespace EcoFashionBackEnd.Common.Payloads.Responses
{
    public class OrderSellerViewModel
    {
        public int OrderId { get; set; }
        public string UserName { get; set; } = null!;
        public string ShippingAddress { get; set; } = null!;
        public decimal TotalPrice { get; set; }
        public string OrderDate { get; set; } = null!;
        public string PaymentStatus { get; set; } = null!;
        public string OrderStatus { get; set; } = null!;
        public string FulfillmentStatus { get; set; } = null!;
        
        // Seller-specific information
        public List<SellerOrderDetailModel> SellerItems { get; set; } = new List<SellerOrderDetailModel>();
        public List<OtherSellerInfo> OtherSellers { get; set; } = new List<OtherSellerInfo>();
        
        // Progress information
        public int TotalItemsInOrder { get; set; }
        public int SellerItemsCount { get; set; }
        public int ConfirmedSellerItems { get; set; }
        public bool AllSellerItemsConfirmed { get; set; }
    }
    
    public class SellerOrderDetailModel
    {
        public int OrderDetailId { get; set; }
        public string ItemName { get; set; } = null!;
        public string ItemType { get; set; } = null!; // "material", "design", "product"
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public string Status { get; set; } = null!;
        public string? Notes { get; set; }
        public string? ImageUrl { get; set; }
        public bool CanConfirm { get; set; }
        public bool CanShip { get; set; }
    }
    
    public class OtherSellerInfo
    {
        public Guid SellerId { get; set; }
        public string SellerName { get; set; } = null!;
        public string SellerType { get; set; } = null!; // "Supplier", "Designer"
        public int ItemCount { get; set; }
        public int ConfirmedItems { get; set; }
        public bool AllItemsConfirmed { get; set; }
        public string? AvatarUrl { get; set; }
    }
}