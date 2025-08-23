namespace EcoFashionBackEnd.Common.Payloads.Responses
{
    public class OrderProgressModel
    {
        public int OrderId { get; set; }
        public string UserName { get; set; } = null!;
        public decimal TotalPrice { get; set; }
        public string OrderDate { get; set; } = null!;
        public string PaymentStatus { get; set; } = null!;
        public string FulfillmentStatus { get; set; } = null!;
        
        // Progress information
        public int TotalItems { get; set; }
        public int ConfirmedItems { get; set; }
        public int ShippedItems { get; set; }
        public int DeliveredItems { get; set; }
        
        public double ConfirmationProgress { get; set; } // Percentage
        public double ShippingProgress { get; set; } // Percentage
        public double DeliveryProgress { get; set; } // Percentage
        
        // Seller progress breakdown
        public List<SellerProgress> SellerProgressList { get; set; } = new List<SellerProgress>();
        
        // Estimated dates
        public string? EstimatedShippingDate { get; set; }
        public string? EstimatedDeliveryDate { get; set; }
        
        // Timeline
        public List<OrderTimelineEvent> Timeline { get; set; } = new List<OrderTimelineEvent>();
    }
    
    public class SellerProgress
    {
        public Guid SellerId { get; set; }
        public string SellerName { get; set; } = null!;
        public string SellerType { get; set; } = null!;
        public string? AvatarUrl { get; set; }
        
        public int TotalItems { get; set; }
        public int ConfirmedItems { get; set; }
        public int ShippedItems { get; set; }
        
        public string Status { get; set; } = null!; // "Pending", "Confirmed", "Shipped", "Delivered"
        public double Progress { get; set; } // Percentage
        
        public List<ItemProgress> Items { get; set; } = new List<ItemProgress>();
    }
    
    public class ItemProgress
    {
        public int OrderDetailId { get; set; }
        public string ItemName { get; set; } = null!;
        public string ItemType { get; set; } = null!;
        public int Quantity { get; set; }
        public string Status { get; set; } = null!;
        public string? ImageUrl { get; set; }
    }
    
    public class OrderTimelineEvent
    {
        public DateTime EventDate { get; set; }
        public string EventType { get; set; } = null!; // "Ordered", "Paid", "Confirmed", "Shipped", "Delivered"
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string? SellerName { get; set; }
        public string? Icon { get; set; } // For frontend icon reference
        public string Status { get; set; } = "completed"; // "completed", "current", "pending"
    }
}