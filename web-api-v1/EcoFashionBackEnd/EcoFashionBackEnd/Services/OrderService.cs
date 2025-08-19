using AutoMapper;
using EcoFashionBackEnd.Common.Payloads.Requests;
using EcoFashionBackEnd.Dtos;
using EcoFashionBackEnd.Entities;
using EcoFashionBackEnd.Repositories;
using Microsoft.EntityFrameworkCore;

namespace EcoFashionBackEnd.Services
{
    public class OrderService
    {
        private readonly IRepository<Order, int> _orderRepository;
        private readonly AppDbContext _dbContext;
        private readonly IMapper _mapper;
        public OrderService(IRepository<Order, int> repository, AppDbContext dbContext, IMapper mapper)
        {
            _orderRepository = repository;
            _dbContext = dbContext;
            _mapper = mapper;
        }
        public async Task<IEnumerable<OrderModel>> GetAllOrdersAsync()
        {
            var orders = await _dbContext.Orders
                .Include(o => o.User)
                .ToListAsync();
            return orders.Select(order =>
            {
                var supplier = order.SellerId.HasValue ? _dbContext.Suppliers
                    .Where(s => s.SupplierId == order.SellerId)
                    .Select(s => new { s.SupplierName, s.AvatarUrl })
                    .FirstOrDefault() : null;
                var designer = order.SellerId.HasValue ? _dbContext.Designers
                    .Where(d => d.DesignerId == order.SellerId)
                    .Select(d => new { d.DesignerName, d.AvatarUrl })
                    .FirstOrDefault() : null;

                if (supplier == null && designer == null)
                {
                    // Fallback: suy ra từ dòng hàng đầu tiên
                    var od = _dbContext.OrderDetails
                        .Where(od => od.OrderId == order.OrderId)
                        .Select(od => new { od.SupplierId, od.DesignerId })
                        .FirstOrDefault();
                    if (od != null)
                    {
                        if (od.SupplierId.HasValue)
                        {
                            supplier = _dbContext.Suppliers
                                .Where(s => s.SupplierId == od.SupplierId)
                                .Select(s => new { s.SupplierName, s.AvatarUrl })
                                .FirstOrDefault();
                        }
                        else if (od.DesignerId.HasValue)
                        {
                            designer = _dbContext.Designers
                                .Where(d => d.DesignerId == od.DesignerId)
                                .Select(d => new { d.DesignerName, d.AvatarUrl })
                                .FirstOrDefault();
                        }
                    }
                }

                // Auto-fix legacy orders: nếu đã paid nhưng fulfillment = None, tự động set thành Delivered
                var fulfillmentStatus = order.FulfillmentStatus;
                if (order.PaymentStatus == PaymentStatus.Paid && order.FulfillmentStatus == FulfillmentStatus.None)
                {
                    fulfillmentStatus = FulfillmentStatus.Delivered;
                    // Cập nhật luôn trong database
                    order.FulfillmentStatus = FulfillmentStatus.Delivered;
                    order.Status = OrderStatus.delivered;
                    _dbContext.Orders.Update(order);
                    _dbContext.SaveChanges();
                }

                return new OrderModel
                {
                    OrderId = order.OrderId,
                    UserId = order.UserId,
                    UserName = order.User.FullName,
                    ShippingAddress = order.ShippingAddress,
                    TotalPrice = order.TotalPrice,
                    OrderDate = order.OrderDate,
                    Status = order.Status.ToString(),
                    PaymentStatus = order.PaymentStatus.ToString(),
                    FulfillmentStatus = fulfillmentStatus.ToString(),
                    SellerType = order.SellerType,
                    SellerName = supplier?.SupplierName ?? designer?.DesignerName,
                    SellerAvatarUrl = supplier?.AvatarUrl ?? designer?.AvatarUrl,
                };
            });
        }
        public async Task<IEnumerable<OrderModel>> GetOrdersByUserIdAsync(int userId)
        {
            var orders = await _dbContext.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.User)
                .ToListAsync();
            return orders.Select(order =>
            {
                var supplier = order.SellerId.HasValue ? _dbContext.Suppliers
                    .Where(s => s.SupplierId == order.SellerId)
                    .Select(s => new { s.SupplierName, s.AvatarUrl })
                    .FirstOrDefault() : null;
                var designer = order.SellerId.HasValue ? _dbContext.Designers
                    .Where(d => d.DesignerId == order.SellerId)
                    .Select(d => new { d.DesignerName, d.AvatarUrl })
                    .FirstOrDefault() : null;

                if (supplier == null && designer == null)
                {
                    // Fallback: suy ra từ dòng hàng đầu tiên
                    var od = _dbContext.OrderDetails
                        .Where(od => od.OrderId == order.OrderId)
                        .Select(od => new { od.SupplierId, od.DesignerId })
                        .FirstOrDefault();
                    if (od != null)
                    {
                        if (od.SupplierId.HasValue)
                        {
                            supplier = _dbContext.Suppliers
                                .Where(s => s.SupplierId == od.SupplierId)
                                .Select(s => new { s.SupplierName, s.AvatarUrl })
                                .FirstOrDefault();
                        }
                        else if (od.DesignerId.HasValue)
                        {
                            designer = _dbContext.Designers
                                .Where(d => d.DesignerId == od.DesignerId)
                                .Select(d => new { d.DesignerName, d.AvatarUrl })
                                .FirstOrDefault();
                        }
                    }
                }

                // Auto-fix legacy orders: nếu đã paid nhưng fulfillment = None, tự động set thành Delivered
                var fulfillmentStatus = order.FulfillmentStatus;
                if (order.PaymentStatus == PaymentStatus.Paid && order.FulfillmentStatus == FulfillmentStatus.None)
                {
                    fulfillmentStatus = FulfillmentStatus.Delivered;
                    // Cập nhật luôn trong database
                    order.FulfillmentStatus = FulfillmentStatus.Delivered;
                    order.Status = OrderStatus.delivered;
                    _dbContext.Orders.Update(order);
                    _dbContext.SaveChanges();
                }

                return new OrderModel
                {
                    OrderId = order.OrderId,
                    UserId = order.UserId,
                    UserName = order.User.FullName,
                    ShippingAddress = order.ShippingAddress,
                    TotalPrice = order.TotalPrice,
                    OrderDate = order.OrderDate,
                    Status = order.Status.ToString(),
                    PaymentStatus = order.PaymentStatus.ToString(),
                    FulfillmentStatus = fulfillmentStatus.ToString(),
                    SellerType = order.SellerType,
                    SellerName = supplier?.SupplierName ?? designer?.DesignerName,
                    SellerAvatarUrl = supplier?.AvatarUrl ?? designer?.AvatarUrl,
                };
            });
        }
        public async Task<OrderModel?> GetOrderByIdAsync(int id)
        {
            var order = await _dbContext.Orders
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.OrderId == id);
            if (order == null) return null;
            var supplier = order.SellerId.HasValue ? _dbContext.Suppliers
                .Where(s => s.SupplierId == order.SellerId)
                .Select(s => new { s.SupplierName, s.AvatarUrl })
                .FirstOrDefault() : null;
            var designer = order.SellerId.HasValue ? _dbContext.Designers
                .Where(d => d.DesignerId == order.SellerId)
                .Select(d => new { d.DesignerName, d.AvatarUrl })
                .FirstOrDefault() : null;

            if (supplier == null && designer == null)
            {
                var od = _dbContext.OrderDetails
                    .Where(od => od.OrderId == order.OrderId)
                    .Select(od => new { od.SupplierId, od.DesignerId })
                    .FirstOrDefault();
                if (od != null)
                {
                    if (od.SupplierId.HasValue)
                    {
                        supplier = _dbContext.Suppliers
                            .Where(s => s.SupplierId == od.SupplierId)
                            .Select(s => new { s.SupplierName, s.AvatarUrl })
                            .FirstOrDefault();
                    }
                    else if (od.DesignerId.HasValue)
                    {
                        designer = _dbContext.Designers
                            .Where(d => d.DesignerId == od.DesignerId)
                            .Select(d => new { d.DesignerName, d.AvatarUrl })
                            .FirstOrDefault();
                    }
                }
            }

            return new OrderModel
            {
                OrderId = order.OrderId,
                UserId = order.UserId,
                UserName = order.User.FullName,
                ShippingAddress = order.ShippingAddress,
                TotalPrice = order.TotalPrice,
                OrderDate = order.OrderDate,
                Status = order.Status.ToString(),
                PaymentStatus = order.PaymentStatus.ToString(),
                SellerType = order.SellerType,
                SellerName = supplier?.SupplierName ?? designer?.DesignerName,
                SellerAvatarUrl = supplier?.AvatarUrl ?? designer?.AvatarUrl,
            };
        }
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
            var orders = await _dbContext.Orders
                .Where(o => o.SellerId == sellerId && o.PaymentStatus == PaymentStatus.Paid)
                .Include(o => o.User)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return orders.Select(order => 
            {
                var supplier = _dbContext.Suppliers
                    .Where(s => s.SupplierId == sellerId)
                    .Select(s => new { s.SupplierName, s.AvatarUrl })
                    .FirstOrDefault();
                var designer = _dbContext.Designers
                    .Where(d => d.DesignerId == sellerId)
                    .Select(d => new { d.DesignerName, d.AvatarUrl })
                    .FirstOrDefault();

                return new OrderModel
                {
                    OrderId = order.OrderId,
                    UserId = order.UserId,
                    UserName = order.User.FullName,
                    ShippingAddress = order.ShippingAddress,
                    TotalPrice = order.TotalPrice,
                    OrderDate = order.OrderDate,
                    Status = order.Status.ToString(),
                    PaymentStatus = order.PaymentStatus.ToString(),
                    FulfillmentStatus = order.FulfillmentStatus.ToString(),
                    SellerType = order.SellerType,
                    SellerName = supplier?.SupplierName ?? designer?.DesignerName,
                    SellerAvatarUrl = supplier?.AvatarUrl ?? designer?.AvatarUrl,
                };
            });
        }

        // Mark order as shipped
        public async Task<bool> MarkOrderShippedAsync(int orderId, ShipOrderRequest request)
        {
            var order = await _dbContext.Orders.FindAsync(orderId);
            if (order == null || order.PaymentStatus != PaymentStatus.Paid) return false;

            order.FulfillmentStatus = FulfillmentStatus.Shipped;
            order.Status = OrderStatus.shipped;
            
            // TODO: Save tracking info to a separate tracking table if needed
            // For now, we'll just update the status
            
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
            // Calculate commission (10%) and net amount (90%)
            var commissionRate = 0.10m;
            var commissionAmount = order.TotalPrice * commissionRate;
            var netAmount = order.TotalPrice - commissionAmount;

            // Update order with settlement info
            order.CommissionRate = commissionRate;
            order.CommissionAmount = commissionAmount;
            order.NetAmount = netAmount;

            // Find seller wallet and transfer money
            if (order.SellerId.HasValue)
            {
                var sellerWallet = await _dbContext.Wallets
                    .FirstOrDefaultAsync(w => w.UserId.ToString() == order.SellerId.ToString());

                if (sellerWallet != null)
                {
                    // Transfer money from admin wallet to seller wallet
                    var adminWallet = await _dbContext.Wallets
                        .FirstOrDefaultAsync(w => w.IsSystemWallet == true);

                    if (adminWallet != null && adminWallet.Balance >= netAmount)
                    {
                        // Deduct from admin wallet
                        adminWallet.Balance -= netAmount;
                        
                        // Add to seller wallet
                        sellerWallet.Balance += netAmount;

                        // Create wallet transactions
                        var adminTransaction = new WalletTransaction
                        {
                            WalletId = adminWallet.WalletId,
                            Amount = -netAmount,
                            TransactionType = "OrderSettlement",
                            Description = $"Settlement for order #{order.OrderId}",
                            TransactionDate = DateTime.UtcNow,
                            Status = "Completed"
                        };

                        var sellerTransaction = new WalletTransaction
                        {
                            WalletId = sellerWallet.WalletId,
                            Amount = netAmount,
                            TransactionType = "OrderSettlement",
                            Description = $"Payment received for order #{order.OrderId}",
                            TransactionDate = DateTime.UtcNow,
                            Status = "Completed"
                        };

                        _dbContext.WalletTransactions.Add(adminTransaction);
                        _dbContext.WalletTransactions.Add(sellerTransaction);
                    }
                }
            }
        }

    }
}
