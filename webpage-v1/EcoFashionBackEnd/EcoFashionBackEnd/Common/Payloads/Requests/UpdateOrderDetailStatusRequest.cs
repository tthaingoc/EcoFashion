using System.ComponentModel.DataAnnotations;
using EcoFashionBackEnd.Entities;

namespace EcoFashionBackEnd.Common.Payloads.Requests
{
    public class UpdateOrderDetailStatusRequest
    {
        [Required]
        [EnumDataType(typeof(OrderDetailStatus))]
        public OrderDetailStatus Status { get; set; }
        
        public string? Notes { get; set; }
        public string? EstimatedShippingDate { get; set; }
    }
}