namespace EcoFashionBackEnd.Dtos
{
    public class SubOrderModel
    {
        public int SubOrderId { get; set; }
        public int ParentOrderId { get; set; }
        
        // Seller Information
        public string SellerId { get; set; } = string.Empty;
        public string SellerName { get; set; } = string.Empty;
        public string SellerType { get; set; } = string.Empty; // "Supplier" or "Designer"
        public string? SellerAvatarUrl { get; set; }

        // Financial Information
        public decimal Subtotal { get; set; }
        public decimal ShippingFee { get; set; }
        public decimal TotalPrice { get; set; }

        // Status Information
        public string Status { get; set; } = string.Empty;
        public string FulfillmentStatus { get; set; } = string.Empty;

        // Tracking Information
        public string? TrackingNumber { get; set; }
        public string? ShippingCarrier { get; set; }
        public string? Notes { get; set; }

        // Timestamps
        public string CreatedAt { get; set; } = string.Empty;
        public string? ConfirmedAt { get; set; }
        public string? ShippedAt { get; set; }
        public string? DeliveredAt { get; set; }
        public string? EstimatedShippingDate { get; set; }
        public string? EstimatedDeliveryDate { get; set; }

        // Parent Order Information
        public string UserName { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;

        // Items in this sub-order
        public List<SubOrderItemModel> Items { get; set; } = new List<SubOrderItemModel>();
    }

    public class SubOrderItemModel
    {
        public int OrderDetailId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string ItemType { get; set; } = string.Empty; // "material", "design", "product"
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
    }
}