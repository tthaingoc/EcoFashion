using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoFashionBackEnd.Entities
{
    [Table("SubOrders")]
    public class SubOrder
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SubOrderId { get; set; }

        // Link to parent order (for payment tracking)
        [Required]
        public required int ParentOrderId { get; set; }
        [ForeignKey("ParentOrderId")]
        public virtual Order ParentOrder { get; set; } = null!;

        // Seller information (either Supplier or Designer)
        public Guid? SupplierId { get; set; }
        public Guid? DesignerId { get; set; }
        
        [ForeignKey("SupplierId")]
        public virtual Supplier? Supplier { get; set; }
        [ForeignKey("DesignerId")]
        public virtual Designer? Designer { get; set; }

        // Derived seller info for easier queries
        public Guid SellerId { get; set; } // Either SupplierId or DesignerId
        public required string SellerName { get; set; }
        public required string SellerType { get; set; } // "Supplier" or "Designer"
        public string? SellerAvatarUrl { get; set; }

        // Financial breakdown for this sub-order
        public decimal Subtotal { get; set; }
        public decimal ShippingFee { get; set; }
        public decimal TotalPrice { get; set; }

        // Independent status management
        public SubOrderStatus Status { get; set; } = SubOrderStatus.Pending;
        public FulfillmentStatus FulfillmentStatus { get; set; } = FulfillmentStatus.None;

        // Tracking information (independent per sub-order)
        public string? TrackingNumber { get; set; }
        public string? ShippingCarrier { get; set; }
        public string? Notes { get; set; }

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ConfirmedAt { get; set; }
        public DateTime? ShippedAt { get; set; }
        public DateTime? DeliveredAt { get; set; }

        // Estimated dates
        public DateTime? EstimatedShippingDate { get; set; }
        public DateTime? EstimatedDeliveryDate { get; set; }

        // Navigation properties
        public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
    }

    public enum SubOrderStatus
    {
        Pending,        // Chờ seller xác nhận
        Confirmed,      // Seller đã xác nhận
        Processing,     // Đang chuẩn bị hàng
        Shipped,        // Đã gửi hàng
        Delivered,      // Đã giao hàng (trigger settlement)
        Canceled,       // Đã hủy
        Returned        // Đã trả hàng
    }
}