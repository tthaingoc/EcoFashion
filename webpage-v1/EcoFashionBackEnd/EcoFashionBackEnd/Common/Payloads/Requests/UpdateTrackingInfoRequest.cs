using System.ComponentModel.DataAnnotations;

namespace EcoFashionBackEnd.Common.Payloads.Requests
{
    public class UpdateTrackingInfoRequest
    {
        [Required]
        [StringLength(100)]
        public string TrackingNumber { get; set; } = string.Empty;

        [StringLength(50)]
        public string? ShippingCarrier { get; set; }

        public string? Notes { get; set; }

        public string? EstimatedDeliveryDate { get; set; }
    }
}