﻿using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoFashionBackEnd.Entities
{
    [Table("Orders")]
    public class Order
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int OrderId { get; set; }
        [Required]
        public required int UserId { get; set; }
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
        // Grouping for multi-seller checkout sessions
        public Guid? OrderGroupId { get; set; }
        [ForeignKey("OrderGroupId")]
        public virtual OrderGroup? OrderGroup { get; set; }

        // Link to checkout session for flexible checkout
        public Guid? CheckoutSessionId { get; set; }
        [ForeignKey("CheckoutSessionId")]
        public virtual CheckoutSession? CheckoutSession { get; set; }

        // Provider info for this order (single provider per order)
        public Guid? SupplierId { get; set; }
        public Guid? DesignerId { get; set; }
        public string? ProviderName { get; set; }
        public string? ProviderType { get; set; } // "Supplier" or "Designer"

        [ForeignKey("SupplierId")]
        public virtual Supplier? Supplier { get; set; }
        [ForeignKey("DesignerId")]
        public virtual Designer? Designer { get; set; }
        [Required]
        public required string ShippingAddress { get; set; }
        // Monetary breakdown
        public decimal Subtotal { get; set; }
        public decimal ShippingFee { get; set; }
        public decimal Discount { get; set; }
        [Required]
        public required decimal TotalPrice { get; set; }
        [Required]
        [EnumDataType(typeof(OrderStatus))]
        public OrderStatus Status { get; set; } = OrderStatus.pending;
        // Payment status separate from fulfillment
        [EnumDataType(typeof(PaymentStatus))]
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
        // Fulfillment status for shipping lifecycle
        [EnumDataType(typeof(FulfillmentStatus))]
        public FulfillmentStatus FulfillmentStatus { get; set; } = FulfillmentStatus.None;
        // Commission for platform
        public decimal? CommissionRate { get; set; }
        public decimal? CommissionAmount { get; set; }
        public decimal? NetAmount { get; set; }
        // Note: Seller info is determined dynamically from OrderDetails
        // since orders can contain mixed items from different suppliers/designers
        // Expiry to release reserved stock
        public DateTime? ExpiresAt { get; set; }
        public DateTime OrderDate { get; set; }
        public DateTime CreateAt { get; set; } = DateTime.Now;
        public virtual ICollection<PaymentTransaction> PaymentTransactions { get; set; } = new List<PaymentTransaction>();
        public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();
    }
    public enum OrderStatus
    {
        pending,
        processing,
        shipped,
        delivered,
        returned,
    }
    public enum PaymentStatus
    {
        Pending,
        Paid,// check out trừ tiền trong ví customer + ở ví admin (ví hệ thống)+ hết có walletTransaction 
        Failed,
        Expired
    }
    public enum FulfillmentStatus
    {
        None,
        Processing,
        Shipped,
        Delivered,// chia tiền admin trả tiền lại người bán 90% 
        Canceled
    }
}