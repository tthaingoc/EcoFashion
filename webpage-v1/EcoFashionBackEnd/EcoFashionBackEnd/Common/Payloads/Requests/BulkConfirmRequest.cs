using System.ComponentModel.DataAnnotations;

namespace EcoFashionBackEnd.Common.Payloads.Requests
{
    public class BulkConfirmRequest
    {
        public string? Notes { get; set; }
        public string? EstimatedShippingDate { get; set; }
        
        [Required]
        public List<int> OrderDetailIds { get; set; } = new List<int>();
    }
}