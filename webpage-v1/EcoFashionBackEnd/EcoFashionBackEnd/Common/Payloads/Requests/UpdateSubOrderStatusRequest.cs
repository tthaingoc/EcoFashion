using System.ComponentModel.DataAnnotations;
using EcoFashionBackEnd.Entities;

namespace EcoFashionBackEnd.Common.Payloads.Requests
{
    public class UpdateSubOrderStatusRequest
    {
        [Required]
        [EnumDataType(typeof(SubOrderStatus))]
        public SubOrderStatus Status { get; set; }

        public string? Notes { get; set; }

        public string? EstimatedShippingDate { get; set; }

        public string? EstimatedDeliveryDate { get; set; }
    }
}