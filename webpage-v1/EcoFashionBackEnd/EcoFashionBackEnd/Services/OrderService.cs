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
        private readonly IRepository<Order, int> _orderRepository;
        private readonly AppDbContext _dbContext;
        private readonly IMapper _mapper;
        private readonly WalletService _walletService;
        private readonly IConfiguration _configuration;

        public OrderService(
            IRepository<Order, int> repository, 
            AppDbContext dbContext, 
            IMapper mapper,
            WalletService walletService,
            IConfiguration configuration)
        {
            _orderRepository = repository;
            _dbContext = dbContext;
            _mapper = mapper;
            _walletService = walletService;
            _configuration = configuration;
        }

        private OrderModel MapOrderToModel(Order order)
        {
            // Get seller info from OrderDetails since orders can have mixed items
            var orderDetailsInfo = _dbContext.OrderDetails
                .Where(od => od.OrderId == order.OrderId)
                .Select(od => new { od.SupplierId, od.DesignerId })
                .ToList();

            // Determine primary seller - if mixed, show appropriate info
            var suppliers = orderDetailsInfo.Where(od => od.SupplierId.HasValue).Select(od => od.SupplierId!.Value).Distinct().ToList();
            var designers = orderDetailsInfo.Where(od => od.DesignerId.HasValue).Select(od => od.DesignerId!.Value).Distinct().ToList();

            string sellerName = "Multiple Sellers";
            string sellerType = "Mixed";
            string? sellerAvatarUrl = null;

            if (suppliers.Count == 1 && designers.Count == 0)
            {
                // Single supplier order
                var supplier = _dbContext.Suppliers
                    .Where(s => s.SupplierId == suppliers.First())
                    .Select(s => new { s.SupplierName, s.AvatarUrl })
                    .FirstOrDefault();
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
                var designer = _dbContext.Designers
                    .Where(d => d.DesignerId == designers.First())
                    .Select(d => new { d.DesignerName, d.AvatarUrl })
                    .FirstOrDefault();
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

            // Lấy SĐT từ địa chỉ mặc định của user nếu có
            string? personalPhone = null;
            try
            {
                var defaultAddr = _dbContext.UserAddresses
                    .AsNoTracking()
                    .FirstOrDefault(ua => ua.UserId == order.UserId && ua.IsDefault);
                if (defaultAddr != null)
                {
                    personalPhone = defaultAddr.PersonalPhoneNumber;
                }
            }
            catch { }

            return new OrderModel
            {
                OrderId = order.OrderId,
                UserId = order.UserId,
                UserName = order.User?.FullName ?? "Unknown User",
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
            var orders = await _dbContext.Orders
                .Include(o => o.User)
                .ToListAsync();
            
            return orders.Select(MapOrderToModel);
        }

        public async Task<IEnumerable<OrderModel>> GetOrdersByUserIdAsync(int userId)
        {
            var orders = await _dbContext.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.User)
                .ToListAsync();
            
            return orders.Select(MapOrderToModel);
        }

        public async Task<OrderModel?> GetOrderByIdAsync(int id)
        {
            var order = await _dbContext.Orders
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.OrderId == id);
                
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
            await _dbContext.SaveChangesAsync();
            return order.OrderId;
        }

        public async Task<bool> UpdateOrderAsync(int orderId, UpdateOrderRequest request)
        {
            var order = await _dbContext.Orders.FindAsync(orderId);
            if (order == null) return false;

            if (!string.IsNullOrWhiteSpace(request.ShippingAddress))
                order.ShippingAddress = request.ShippingAddress;

            if (request.TotalPrice.HasValue)
                order.TotalPrice = request.TotalPrice.Value;

            if (request.Status.HasValue)
                order.Status = request.Status.Value;

            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteOrderAsync(int id)
        {
            var result = _orderRepository.Remove(id);
            await _dbContext.SaveChangesAsync();
            return result != null;
        }

        public async Task<bool> UpdateFulfillmentStatusAsync(int orderId, FulfillmentStatus fulfillmentStatus)
        {
            var order = await _dbContext.Orders.FindAsync(orderId);
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
                    break;
                case FulfillmentStatus.Canceled:
                    order.Status = OrderStatus.returned;
                    break;
            }

            await _dbContext.SaveChangesAsync();
            return true;
        }


        // Get orders by seller ID for shipment management
        public async Task<IEnumerable<OrderModel>> GetOrdersBySellerIdAsync(Guid sellerId)
        {
            // Since we removed sellerId, we need to find orders through OrderDetails
            var orderIds = await _dbContext.OrderDetails
                .Where(od => od.SupplierId == sellerId || od.DesignerId == sellerId)
                .Select(od => od.OrderId)
                .Distinct()
                .ToListAsync();

            var orders = await _dbContext.Orders
                .Where(o => orderIds.Contains(o.OrderId) && o.PaymentStatus == PaymentStatus.Paid)
                .Include(o => o.User)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return orders.Select(MapOrderToModel);
        }

        // Mark order as shipped
        public async Task<bool> MarkOrderShippedAsync(int orderId, ShipOrderRequest request)
        {
            var order = await _dbContext.Orders.FindAsync(orderId);
            if (order == null || order.PaymentStatus != PaymentStatus.Paid) return false;

            order.FulfillmentStatus = FulfillmentStatus.Shipped;
            order.Status = OrderStatus.shipped;
            
            await _dbContext.SaveChangesAsync();
            return true;
        }

        // Mark order as delivered and trigger settlement
        public async Task<bool> MarkOrderDeliveredAsync(int orderId)
        {
            var order = await _dbContext.Orders.FindAsync(orderId);
            if (order == null || order.PaymentStatus != PaymentStatus.Paid) return false;

            order.FulfillmentStatus = FulfillmentStatus.Delivered;
            order.Status = OrderStatus.delivered;
            
            // Process settlement (90% to seller, 10% platform commission)
            await ProcessSettlementAsync(order);
            
            await _dbContext.SaveChangesAsync();
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
                    _dbContext.Wallets.Add(adminWallet);
                    await _dbContext.SaveChangesAsync();
                }

                // Process settlements for each seller in the order
                var orderDetails = await _dbContext.OrderDetails
                    .Where(od => od.OrderId == order.OrderId)
                    .ToListAsync();

                var sellerSettlements = new Dictionary<int, decimal>();

                foreach (var detail in orderDetails)
                {
                    var itemTotal = detail.Quantity * detail.UnitPrice;
                    var itemNetAmount = itemTotal * 0.9m; // 90% to seller

                    int? sellerUserId = null;
                    if (detail.SupplierId.HasValue)
                    {
                        var supplier = await _dbContext.Suppliers
                            .FirstOrDefaultAsync(s => s.SupplierId == detail.SupplierId);
                        sellerUserId = supplier?.UserId;
                    }
                    else if (detail.DesignerId.HasValue)
                    {
                        var designer = await _dbContext.Designers
                            .FirstOrDefaultAsync(d => d.DesignerId == detail.DesignerId);
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
                        _dbContext.Wallets.Add(sellerWallet);
                        await _dbContext.SaveChangesAsync();
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

                        _dbContext.WalletTransactions.Add(adminTransaction);
                        _dbContext.WalletTransactions.Add(sellerTransaction);
                    }
                }
            }
            catch (Exception ex)
            {
                // Log error but don't throw to avoid breaking the order completion
                Console.WriteLine($"Settlement error for order {order.OrderId}: {ex.Message}");
            }
        }

        // ===== ORDER SPLITTING SYSTEM =====

        /// <summary>
        /// Process order splitting after successful payment
        /// This method should be called after payment is confirmed
        /// </summary>
        public async Task<bool> ProcessOrderSplittingAsync(int orderId)
        {
            try
            {
                var order = await _dbContext.Orders
                    .Include(o => o.OrderDetails)
                    .FirstOrDefaultAsync(o => o.OrderId == orderId);

                if (order == null || order.PaymentStatus != PaymentStatus.Paid)
                    return false;

                // Check if order has multiple sellers
                var orderDetails = order.OrderDetails.ToList();
                var sellerGroups = orderDetails
                    .GroupBy(od => od.SupplierId ?? od.DesignerId)
                    .Where(g => g.Key.HasValue)
                    .ToList();

                // If only one seller, no need to split
                if (sellerGroups.Count <= 1)
                    return true;

                // Create sub-orders for each seller (inline implementation to avoid circular dependency)
                var subOrders = await CreateSubOrdersFromOrderInlineAsync(orderId);

                if (subOrders.Any())
                {
                    // Update parent order to indicate it has been split
                    order.Status = OrderStatus.processing;
                    order.FulfillmentStatus = FulfillmentStatus.None; // Reset to None, will be calculated from sub-orders
                    
                    _dbContext.Orders.Update(order);
                    await _dbContext.SaveChangesAsync();

                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error splitting order {orderId}: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Calculate overall order status from sub-orders
        /// </summary>
        public async Task<bool> UpdateOrderStatusFromSubOrdersAsync(int orderId)
        {
            try
            {
                var order = await _dbContext.Orders.FindAsync(orderId);
                if (order == null) return false;

                var subOrders = await _dbContext.SubOrders
                    .Where(so => so.ParentOrderId == orderId)
                    .ToListAsync();

                if (!subOrders.Any()) return true;

                // Calculate overall fulfillment status
                var confirmedCount = subOrders.Count(so => so.Status >= SubOrderStatus.Confirmed);
                var shippedCount = subOrders.Count(so => so.Status >= SubOrderStatus.Shipped);
                var deliveredCount = subOrders.Count(so => so.Status == SubOrderStatus.Delivered);
                var totalCount = subOrders.Count;

                FulfillmentStatus newFulfillmentStatus;
                OrderStatus newOrderStatus;

                if (deliveredCount == totalCount)
                {
                    // All sub-orders delivered
                    newFulfillmentStatus = FulfillmentStatus.Delivered;
                    newOrderStatus = OrderStatus.delivered;
                }
                else if (shippedCount == totalCount)
                {
                    // All sub-orders shipped
                    newFulfillmentStatus = FulfillmentStatus.Shipped;
                    newOrderStatus = OrderStatus.shipped;
                }
                else if (confirmedCount == totalCount)
                {
                    // All sub-orders confirmed
                    newFulfillmentStatus = FulfillmentStatus.Processing;
                    newOrderStatus = OrderStatus.processing;
                }
                else if (confirmedCount > 0)
                {
                    // Partially confirmed - keep processing status
                    newFulfillmentStatus = FulfillmentStatus.Processing;
                    newOrderStatus = OrderStatus.processing;
                }
                else
                {
                    // No confirmations yet
                    newFulfillmentStatus = FulfillmentStatus.None;
                    newOrderStatus = OrderStatus.processing;
                }

                // Update order if status changed
                if (order.FulfillmentStatus != newFulfillmentStatus || order.Status != newOrderStatus)
                {
                    order.FulfillmentStatus = newFulfillmentStatus;
                    order.Status = newOrderStatus;

                    // Trigger settlement if all delivered
                    if (newFulfillmentStatus == FulfillmentStatus.Delivered && order.Status != OrderStatus.delivered)
                    {
                        await ProcessSettlementAsync(order);
                    }

                    _dbContext.Orders.Update(order);
                    await _dbContext.SaveChangesAsync();
                }

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating order status from sub-orders {orderId}: {ex.Message}");
                return false;
            }
        }

        /// <summary>
        /// Check if an order should be split (has multiple sellers)
        /// </summary>
        public async Task<bool> ShouldSplitOrderAsync(int orderId)
        {
            var order = await _dbContext.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null) return false;

            var uniqueSellers = order.OrderDetails
                .Select(od => od.SupplierId ?? od.DesignerId)
                .Where(sellerId => sellerId.HasValue)
                .Distinct()
                .Count();

            return uniqueSellers > 1;
        }

        /// <summary>
        /// Get sub-orders for a parent order (convenience method)
        /// </summary>
        public async Task<IEnumerable<SubOrder>> GetSubOrdersAsync(int parentOrderId)
        {
            return await _dbContext.SubOrders
                .Include(so => so.Supplier)
                .Include(so => so.Designer)
                .Include(so => so.OrderDetails)
                .Where(so => so.ParentOrderId == parentOrderId)
                .OrderBy(so => so.CreatedAt)
                .ToListAsync();
        }

        /// <summary>
        /// Create sub-orders inline (to avoid circular dependency with SubOrderService)
        /// </summary>
        private async Task<List<SubOrder>> CreateSubOrdersFromOrderInlineAsync(int parentOrderId)
        {
            var parentOrder = await _dbContext.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.OrderId == parentOrderId);

            if (parentOrder == null) return new List<SubOrder>();

            var orderDetails = parentOrder.OrderDetails.ToList();
            if (!orderDetails.Any()) return new List<SubOrder>();

            // Group OrderDetails by seller (SupplierId or DesignerId)
            var sellerGroups = orderDetails
                .GroupBy(od => new
                {
                    SellerId = od.SupplierId ?? od.DesignerId,
                    SellerType = od.SupplierId.HasValue ? "Supplier" : "Designer",
                    SupplierId = od.SupplierId,
                    DesignerId = od.DesignerId
                })
                .ToList();

            var createdSubOrders = new List<SubOrder>();

            foreach (var group in sellerGroups)
            {
                if (!group.Key.SellerId.HasValue) continue;

                // Get seller information
                var sellerInfo = await GetSellerInfoInlineAsync(group.Key.SellerId.Value, group.Key.SellerType);
                if (sellerInfo == null) continue;

                // Calculate totals for this sub-order
                var subtotal = group.Sum(od => od.UnitPrice * od.Quantity);
                var shippingFee = CalculateShippingFeeInline(group.ToList());
                
                var subOrder = new SubOrder
                {
                    ParentOrderId = parentOrderId,
                    SellerId = group.Key.SellerId.Value,
                    SellerName = sellerInfo.Name,
                    SellerType = group.Key.SellerType,
                    SellerAvatarUrl = sellerInfo.AvatarUrl,
                    SupplierId = group.Key.SupplierId,
                    DesignerId = group.Key.DesignerId,
                    Subtotal = subtotal,
                    ShippingFee = shippingFee,
                    TotalPrice = subtotal + shippingFee,
                    Status = SubOrderStatus.Pending,
                    FulfillmentStatus = FulfillmentStatus.None,
                    CreatedAt = DateTime.UtcNow
                };

                _dbContext.SubOrders.Add(subOrder);
                await _dbContext.SaveChangesAsync(); // Save to get SubOrderId

                // Update OrderDetails to link to SubOrder
                foreach (var orderDetail in group)
                {
                    orderDetail.SubOrderId = subOrder.SubOrderId;
                }

                _dbContext.OrderDetails.UpdateRange(group);
                createdSubOrders.Add(subOrder);
            }

            await _dbContext.SaveChangesAsync();
            return createdSubOrders;
        }

        private async Task<SellerInfo?> GetSellerInfoInlineAsync(Guid sellerId, string sellerType)
        {
            if (sellerType == "Supplier")
            {
                var supplier = await _dbContext.Suppliers.FirstOrDefaultAsync(s => s.SupplierId == sellerId);
                return supplier != null ? new SellerInfo
                {
                    Name = supplier.SupplierName,
                    AvatarUrl = supplier.AvatarUrl
                } : null;
            }
            else
            {
                var designer = await _dbContext.Designers.FirstOrDefaultAsync(d => d.DesignerId == sellerId);
                return designer != null ? new SellerInfo
                {
                    Name = designer.DesignerName,
                    AvatarUrl = designer.AvatarUrl
                } : null;
            }
        }

        private decimal CalculateShippingFeeInline(List<OrderDetail> orderDetails)
        {
            // Simple shipping calculation - can be enhanced
            var itemCount = orderDetails.Sum(od => od.Quantity);
            return itemCount <= 3 ? 25000 : 50000; // Base shipping fee logic
        }
    }
}