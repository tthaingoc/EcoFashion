﻿using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoFashionBackEnd.Entities
{
    [Table("OrderDetails")]
    public class OrderDetail
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int OrderDetailId { get; set; }
        [ForeignKey("Order")]
        public int OrderId { get; set; }
        public virtual Order Order { get; set; } = null!;

        // Link to SubOrder (for order splitting system)
        public int? SubOrderId { get; set; }
        [ForeignKey("SubOrderId")]
        public virtual SubOrder? SubOrder { get; set; }
        [ForeignKey("Design")]
        public int? DesignId { get; set; }
        public virtual Design? Design { get; set; }
        [ForeignKey("Designer")]
        public Guid? DesignerId { get; set; }
        public virtual Designer? Designer { get; set; }
        [ForeignKey("Material")]
        public int? MaterialId { get; set; }
        public virtual Material? Material { get; set; }
        [ForeignKey("Product")]
        public int? ProductId { get; set; }
        public virtual Product? Product { get; set; }
        [ForeignKey("Supplier")]
        public Guid? SupplierId { get; set; }
        public virtual Supplier? Supplier { get; set; }
        public required int Quantity { get; set; }
        public required decimal UnitPrice { get; set; }
        [EnumDataType(typeof(OrderDetailType))]
        public OrderDetailType Type { get; set; }
        [EnumDataType(typeof(OrderDetailStatus))]
        public OrderDetailStatus Status { get; set; } = OrderDetailStatus.pending;
    }
    public enum OrderDetailType
    {
        design,
        material,
        product
    }
    public enum OrderDetailStatus
    {
        pending,
        confirmed,
        shipping,
        canceled
    }
}
