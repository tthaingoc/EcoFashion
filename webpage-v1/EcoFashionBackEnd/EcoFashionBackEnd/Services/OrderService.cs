using AutoMapper;
using EcoFashionBackEnd.Common.Payloads.Requests;
using EcoFashionBackEnd.Dtos;
using EcoFashionBackEnd.Entities;
using EcoFashionBackEnd.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace EcoFashionBackEnd.Services
{
    public class OrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IMapper _mapper;
        private readonly WalletService _walletService;
        private readonly InventoryService _inventoryService;
        private readonly IConfiguration _configuration;

        public OrderService(
            IOrderRepository orderRepository,
            IMapper mapper,
            WalletService walletService,
            InventoryService inventoryService,
            IConfiguration configuration)
        {
            _orderRepository = orderRepository;
            _mapper = mapper;
            _walletService = walletService;
            _inventoryService = inventoryService;
            _configuration = configuration;
        }
        // After order is delivered, if buyer is a designer, add purchased materials to their inventory
        private async Task AddMaterialsToDesignerInventoryAsync(int orderId, int buyerUserId)
        {
            // Check if buyer is a designer
            var designer = await _orderRepository.GetDesignerByUserIdAsync(buyerUserId);
            if (designer == null)
            {
                return; // buyer is not a designer
            }

            // Get material order details
            var orderDetails = await _orderRepository.GetOrderDetailsByOrderIdAsync(orderId);
            var materialDetails = orderDetails
                .Where(od => od.Type == OrderDetailType.material && od.MaterialId.HasValue)
                .Select(od => new { od.MaterialId, od.Quantity })
                .ToList();

            if (!materialDetails.Any())
            {
                return;
            }

            // Aggregate quantities per materialId
            var addMap = materialDetails
                .GroupBy(x => x.MaterialId!.Value)
                .ToDictionary(g => g.Key, g => g.Sum(x => (decimal)x.Quantity));

            await _inventoryService.AddDesignerMaterialsAsync(designer.DesignerId, addMap, orderId);
        }

        private OrderModel MapOrderToModel(Order order)
        {
            // Get seller info from OrderDetails since orders can have mixed items
            var orderDetailsInfo = _orderRepository.GetOrderDetailsByOrderIdAsync(order.OrderId).Result;

            // Determine primary seller - if mixed, show appropriate info
            var suppliers = orderDetailsInfo.Where(od => od.SupplierId.HasValue).Select(od => od.SupplierId!.Value).Distinct().ToList();
            var designers = orderDetailsInfo.Where(od => od.DesignerId.HasValue).Select(od => od.DesignerId!.Value).Distinct().ToList();

            string sellerName = "Multiple Sellers";
            string sellerType = "Mixed";
            string? sellerAvatarUrl = null;

            if (suppliers.Count == 1 && designers.Count == 0)
            {
                // Single supplier order
                var supplier = _orderRepository.GetSupplierByIdAsync(suppliers.First()).Result;
                if (supplier != null)
                {
                    sellerName = supplier.SupplierName;
                    sellerType = "Supplier";
                    sellerAvatarUrl = supplier.AvatarUrl;
                }
            }
            else if (designers.Count == 1 && suppliers.Count == 0)
            {
                // Single designer order
                var designer = _orderRepository.GetDesignerByIdAsync(designers.First()).Result;
                if (designer != null)
                {
                    sellerName = designer.DesignerName;
                    sellerType = "Designer";
                    sellerAvatarUrl = designer.AvatarUrl;
                }
            }
            else if (suppliers.Count > 0 && designers.Count > 0)
            {
                sellerName = "Mixed Sellers";
                sellerType = "Mixed";
            }
            else if (suppliers.Count > 1)
            {
                sellerName = "Multiple Suppliers";
                sellerType = "Supplier";
            }
            else if (designers.Count > 1)
            {
                sellerName = "Multiple Designers";
                sellerType = "Designer";
            }

            // Lấy SenderName và SĐT từ UserAddress phù hợp với ShippingAddress
            string? personalPhone = null;
            string? senderName = null;
            try
            {
                // Tìm UserAddress phù hợp với ShippingAddress
                var userAddresses = _orderRepository.GetUserAddressesByUserIdAsync(order.UserId).Result;

                UserAddress? matchingAddress = null;

                // Tìm địa chỉ khớp với ShippingAddress
                foreach (var addr in userAddresses)
                {
                    var formattedAddr = $"{addr.AddressLine}, {addr.District}, {addr.City}";
                    if (order.ShippingAddress.Contains(addr.AddressLine ?? "") ||
                        formattedAddr == order.ShippingAddress ||
                        order.ShippingAddress.Contains(formattedAddr))
                    {
                        matchingAddress = addr;
                        break;
                    }
                }

                // Nếu không tìm thấy, dùng địa chỉ mặc định
                if (matchingAddress == null)
                {
                    matchingAddress = userAddresses.FirstOrDefault(ua => ua.IsDefault);
                }

                if (matchingAddress != null)
                {
                    personalPhone = matchingAddress.PersonalPhoneNumber;
                    senderName = matchingAddress.SenderName;
                }
            }
            catch { }

            return new OrderModel
            {
                OrderId = order.OrderId,
                UserId = order.UserId,
                UserName = senderName ?? order.User?.FullName ?? "Unknown User",
                ShippingAddress = order.ShippingAddress,
                PersonalPhoneNumber = personalPhone,
                TotalPrice = order.TotalPrice,
                OrderDate = order.OrderDate,
                Status = order.Status.ToString(),
                PaymentStatus = order.PaymentStatus.ToString(),
                FulfillmentStatus = order.FulfillmentStatus.ToString(),
                SellerType = sellerType,
                SellerName = sellerName,
                SellerAvatarUrl = sellerAvatarUrl,
            };
        }

        public async Task<IEnumerable<OrderModel>> GetAllOrdersAsync()
        {
            var orders = await _orderRepository.GetAllOrdersWithUserAsync();
            return orders.Select(MapOrderToModel);
        }

        public async Task<IEnumerable<OrderModel>> GetOrdersByUserIdAsync(int userId)
        {
            var orders = await _orderRepository.GetOrdersByUserIdWithUserAsync(userId);
            return orders.Select(MapOrderToModel);
        }

        public async Task<OrderModel?> GetOrderByIdAsync(int id)
        {
            var order = await _orderRepository.GetOrderByIdWithUserAsync(id);
            if (order == null) return null;
            return MapOrderToModel(order);
        }

        // Copy all other methods from original OrderService with minimal changes
        public async Task<int> CreateOrderAsync(int userId, CreateOrderRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.ShippingAddress))
                throw new ArgumentException("Địa chỉ không được để trống.");
            if (request.TotalPrice < 0)
                throw new ArgumentException("Tổng giá không hợp lệ");
            var order = _mapper.Map<Order>(request);
            order.UserId = userId;
            order.Status = OrderStatus.pending;
            order.OrderDate = DateTime.UtcNow;
            await _orderRepository.AddAsync(order);
            await _orderRepository.SaveChangesAsync();
            return order.OrderId;
        }

        public async Task<bool> UpdateOrderAsync(int orderId, UpdateOrderRequest request)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);
            if (order == null) return false;

            if (!string.IsNullOrWhiteSpace(request.ShippingAddress))
                order.ShippingAddress = request.ShippingAddress;

            if (request.TotalPrice.HasValue)
                order.TotalPrice = request.TotalPrice.Value;

            if (request.Status.HasValue)
                order.Status = request.Status.Value;

            await _orderRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteOrderAsync(int id)
        {
            var result = _orderRepository.Remove(id);
            await _orderRepository.SaveChangesAsync();
            return result != null;
        }

        public async Task<bool> UpdateFulfillmentStatusAsync(int orderId, FulfillmentStatus fulfillmentStatus)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);
            if (order == null) return false;

            order.FulfillmentStatus = fulfillmentStatus;

            // Update main status based on fulfillment status
            switch (fulfillmentStatus)
            {
                case FulfillmentStatus.Processing:
                    order.Status = OrderStatus.processing;
                    break;
                case FulfillmentStatus.Shipped:
                    order.Status = OrderStatus.shipped;
                    break;
                case FulfillmentStatus.Delivered:
                    order.Status = OrderStatus.delivered;
                    // Trigger settlement when delivered
                    await ProcessSettlementAsync(order);
                    // After settlement, if buyer is a designer, add materials to their inventory
                    await AddMaterialsToDesignerInventoryAsync(order.OrderId, order.UserId);
                    break;
                case FulfillmentStatus.Canceled:
                    order.Status = OrderStatus.returned;
                    break;
            }

            await _orderRepository.SaveChangesAsync();
            return true;
        }


        // Get orders by seller ID for shipment management
        public async Task<IEnumerable<OrderModel>> GetOrdersBySellerIdAsync(Guid sellerId)
        {
            // Since we removed sellerId, we need to find orders through OrderDetails
            var orderIds = await _orderRepository.GetOrderIdsBySellerIdAsync(sellerId);

            var orders = await _orderRepository.GetOrdersByIdsWithUserAsync(orderIds);
            var paidOrders = orders.Where(o => o.PaymentStatus == PaymentStatus.Paid).ToList();

            return paidOrders.Select(MapOrderToModel);
        }

        // Mark order as shipped
        public async Task<bool> MarkOrderShippedAsync(int orderId, ShipOrderRequest request)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);
            if (order == null || order.PaymentStatus != PaymentStatus.Paid) return false;

            order.FulfillmentStatus = FulfillmentStatus.Shipped;
            order.Status = OrderStatus.shipped;

            await _orderRepository.SaveChangesAsync();
            return true;
        }

        // Mark order as delivered and trigger settlement
        public async Task<bool> MarkOrderDeliveredAsync(int orderId)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);
            if (order == null || order.PaymentStatus != PaymentStatus.Paid) return false;

            order.FulfillmentStatus = FulfillmentStatus.Delivered;
            order.Status = OrderStatus.delivered;

            // Process settlement (90% to seller, 10% platform commission)
            await ProcessSettlementAsync(order);
            await AddMaterialsToDesignerInventoryAsync(order.OrderId, order.UserId);

            await _orderRepository.SaveChangesAsync();
            return true;
        }

        // Process settlement when order is delivered
        private async Task ProcessSettlementAsync(Order order)
        {
            try
            {
                // Calculate commission (10%) and net amount (90%)
                var commissionRate = 0.10m;
                var commissionAmount = order.TotalPrice * commissionRate;
                var netAmount = order.TotalPrice - commissionAmount;

                // Update order with settlement info
                order.CommissionRate = commissionRate;
                order.CommissionAmount = commissionAmount;
                order.NetAmount = netAmount;

                // Get admin wallet using configuration
                var adminUserId = _configuration.GetValue<int>("AdminUserId", 1);
                var adminWallet = await _walletService.GetWalletByUserIdAsync(adminUserId);

                if (adminWallet == null)
                {
                    // Create admin wallet if it doesn't exist
                    adminWallet = new Wallet
                    {
                        UserId = adminUserId,
                        Balance = 0,
                        CreatedAt = DateTime.UtcNow,
                        LastUpdatedAt = DateTime.UtcNow,
                        Status = WalletStatus.Active
                    };
                    await _orderRepository.AddWalletAsync(adminWallet);
                }

                // Process settlements for each seller in the order
                var orderDetails = await _orderRepository.GetOrderDetailsByOrderIdAsync(order.OrderId);

                var sellerSettlements = new Dictionary<int, decimal>();

                foreach (var detail in orderDetails)
                {
                    var itemTotal = detail.Quantity * detail.UnitPrice;
                    var itemNetAmount = itemTotal * 0.9m; // 90% to seller

                    int? sellerUserId = null;
                    if (detail.SupplierId.HasValue)
                    {
                        var supplier = await _orderRepository.GetSupplierByIdAsync(detail.SupplierId.Value);
                        sellerUserId = supplier?.UserId;
                    }
                    else if (detail.DesignerId.HasValue)
                    {
                        var designer = await _orderRepository.GetDesignerByIdAsync(detail.DesignerId.Value);
                        sellerUserId = designer?.UserId;
                    }

                    if (sellerUserId.HasValue)
                    {
                        if (sellerSettlements.ContainsKey(sellerUserId.Value))
                            sellerSettlements[sellerUserId.Value] += itemNetAmount;
                        else
                            sellerSettlements[sellerUserId.Value] = itemNetAmount;
                    }
                }

                // Transfer money to each seller
                foreach (var settlement in sellerSettlements)
                {
                    var sellerUserId = settlement.Key;
                    var amount = settlement.Value;

                    var sellerWallet = await _walletService.GetWalletByUserIdAsync(sellerUserId);

                    // Create seller wallet if it doesn't exist
                    if (sellerWallet == null)
                    {
                        sellerWallet = new Wallet
                        {
                            UserId = sellerUserId,
                            Balance = 0,
                            CreatedAt = DateTime.UtcNow,
                            LastUpdatedAt = DateTime.UtcNow,
                            Status = WalletStatus.Active
                        };
                        await _orderRepository.AddWalletAsync(sellerWallet);
                    }

                    var amountDouble = (double)amount;

                    // Check if admin wallet has sufficient balance
                    if (adminWallet.Balance >= amountDouble)
                    {
                        var adminBalanceBefore = adminWallet.Balance;
                        var sellerBalanceBefore = sellerWallet.Balance;

                        // Deduct from admin wallet
                        adminWallet.Balance -= amountDouble;
                        adminWallet.LastUpdatedAt = DateTime.UtcNow;

                        // Add to seller wallet
                        sellerWallet.Balance += amountDouble;
                        sellerWallet.LastUpdatedAt = DateTime.UtcNow;

                        // Create wallet transactions
                        var adminTransaction = new WalletTransaction
                        {
                            WalletId = adminWallet.WalletId,
                            Amount = -amountDouble,
                            BalanceBefore = adminBalanceBefore,
                            BalanceAfter = adminWallet.Balance,
                            Type = TransactionType.Transfer,
                            Description = $"Settlement for order #{order.OrderId}",
                            Status = TransactionStatus.Success,
                            OrderId = order.OrderId,
                            CreatedAt = DateTime.UtcNow
                        };

                        var sellerTransaction = new WalletTransaction
                        {
                            WalletId = sellerWallet.WalletId,
                            Amount = amountDouble,
                            BalanceBefore = sellerBalanceBefore,
                            BalanceAfter = sellerWallet.Balance,
                            Type = TransactionType.Transfer,
                            Description = $"Payment received for order #{order.OrderId}",
                            Status = TransactionStatus.Success,
                            OrderId = order.OrderId,
                            CreatedAt = DateTime.UtcNow
                        };

                        await _orderRepository.AddWalletTransactionAsync(adminTransaction);
                        await _orderRepository.AddWalletTransactionAsync(sellerTransaction);
                    }
                }
            }
            catch (Exception ex)
            {
                // Log error but don't throw to avoid breaking the order completion
                Console.WriteLine($"Settlement error for order {order.OrderId}: {ex.Message}");
            }
        }

    }
}