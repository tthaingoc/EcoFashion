namespace EcoFashionBackEnd.Dtos
{
    // Standard Checkout DTOs
    public class CreateSessionFromCartRequest
    {
        public string? ShippingAddress { get; set; }
        public int? AddressId { get; set; }
    }

    public class PayWithWalletRequest
    {
        public int OrderId { get; set; }
        public int? AddressId { get; set; }
    }

    public class PayGroupWithWalletRequest
    {
        public Guid OrderGroupId { get; set; }
        public int? AddressId { get; set; }
    }

    public class UpdateOrderAddressRequest
    {
        public int? AddressId { get; set; }
        public string? ShippingAddress { get; set; }
    }
}