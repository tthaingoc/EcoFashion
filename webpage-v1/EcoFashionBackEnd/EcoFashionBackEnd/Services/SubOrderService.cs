using EcoFashionBackEnd.Entities;
using EcoFashionBackEnd.Repositories;
using Microsoft.EntityFrameworkCore;

namespace EcoFashionBackEnd.Services
{
    public class SubOrderService
    {
        private readonly AppDbContext _dbContext;
        private readonly IRepository<SubOrder, int> _subOrderRepository;

        public SubOrderService(AppDbContext dbContext, IRepository<SubOrder, int> subOrderRepository)
        {
            _dbContext = dbContext;
            _subOrderRepository = subOrderRepository;
        }

        // ===== CORE SUB-ORDER MANAGEMENT =====

        public async Task<IEnumerable<SubOrder>> GetSubOrdersBySellerAsync(Guid sellerId)
        {
            return await _dbContext.SubOrders
                .Include(so => so.ParentOrder).ThenInclude(o => o.User)
                .Include(so => so.OrderDetails).ThenInclude(od => od.Material).ThenInclude(m => m.MaterialImages).ThenInclude(mi => mi.Image)
                .Include(so => so.OrderDetails).ThenInclude(od => od.Product).ThenInclude(p => p.Design).ThenInclude(d => d.DesignImages).ThenInclude(di => di.Image)
                .Include(so => so.OrderDetails).ThenInclude(od => od.Design).ThenInclude(d => d.DesignImages).ThenInclude(di => di.Image)
                .Include(so => so.Supplier)
                .Include(so => so.Designer)
                .Where(so => so.SellerId == sellerId)
                .Where(so => so.ParentOrder.PaymentStatus == PaymentStatus.Paid)
                .OrderByDescending(so => so.CreatedAt)
                .ToListAsync();
        }

        public async Task<SubOrder?> GetSubOrderByIdAsync(int subOrderId)
        {
            return await _dbContext.SubOrders
                .Include(so => so.ParentOrder).ThenInclude(o => o.User)
                .Include(so => so.OrderDetails).ThenInclude(od => od.Material).ThenInclude(m => m.MaterialImages).ThenInclude(mi => mi.Image)
                .Include(so => so.OrderDetails).ThenInclude(od => od.Product).ThenInclude(p => p.Design).ThenInclude(d => d.DesignImages).ThenInclude(di => di.Image)
                .Include(so => so.OrderDetails).ThenInclude(od => od.Design).ThenInclude(d => d.DesignImages).ThenInclude(di => di.Image)
                .Include(so => so.Supplier)
                .Include(so => so.Designer)
                .FirstOrDefaultAsync(so => so.SubOrderId == subOrderId);
        }

        public async Task<IEnumerable<SubOrder>> GetSubOrdersByParentOrderIdAsync(int parentOrderId)
        {
            return await _dbContext.SubOrders
                .Include(so => so.Supplier)
                .Include(so => so.Designer)
                .Include(so => so.OrderDetails).ThenInclude(od => od.Material).ThenInclude(m => m.MaterialImages).ThenInclude(mi => mi.Image)
                .Include(so => so.OrderDetails).ThenInclude(od => od.Product).ThenInclude(p => p.Design).ThenInclude(d => d.DesignImages).ThenInclude(di => di.Image)
                .Include(so => so.OrderDetails).ThenInclude(od => od.Design).ThenInclude(d => d.DesignImages).ThenInclude(di => di.Image)
                .Where(so => so.ParentOrderId == parentOrderId)
                .OrderBy(so => so.CreatedAt)
                .ToListAsync();
        }

        // ===== STATUS MANAGEMENT =====

        public async Task<bool> UpdateSubOrderStatusAsync(int subOrderId, SubOrderStatus status, int userId, string? notes = null)
        {
            var subOrder = await _dbContext.SubOrders
                .Include(so => so.Supplier).ThenInclude(s => s.User)
                .Include(so => so.Designer).ThenInclude(d => d.User)
                .FirstOrDefaultAsync(so => so.SubOrderId == subOrderId);

            if (subOrder == null) return false;

            // Check authorization - user must own the seller profile
            bool isAuthorized = false;
            if (subOrder.SupplierId.HasValue && subOrder.Supplier?.User?.UserId == userId)
                isAuthorized = true;
            else if (subOrder.DesignerId.HasValue && subOrder.Designer?.User?.UserId == userId)
                isAuthorized = true;

            if (!isAuthorized) return false;

            // Update status with timestamps
            var oldStatus = subOrder.Status;
            subOrder.Status = status;
            
            switch (status)
            {
                case SubOrderStatus.Confirmed:
                    if (oldStatus == SubOrderStatus.Pending)
                        subOrder.ConfirmedAt = DateTime.UtcNow;
                    subOrder.FulfillmentStatus = FulfillmentStatus.Processing;
                    break;
                case SubOrderStatus.Shipped:
                    if (subOrder.ShippedAt == null)
                        subOrder.ShippedAt = DateTime.UtcNow;
                    subOrder.FulfillmentStatus = FulfillmentStatus.Shipped;
                    break;
                case SubOrderStatus.Delivered:
                    if (subOrder.DeliveredAt == null)
                        subOrder.DeliveredAt = DateTime.UtcNow;
                    subOrder.FulfillmentStatus = FulfillmentStatus.Delivered;
                    break;
                case SubOrderStatus.Canceled:
                    subOrder.FulfillmentStatus = FulfillmentStatus.Canceled;
                    break;
            }

            if (!string.IsNullOrEmpty(notes))
                subOrder.Notes = notes;

            _dbContext.SubOrders.Update(subOrder);
            await _dbContext.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UpdateTrackingInfoAsync(int subOrderId, string trackingNumber, string? carrier = null, int? userId = null)
        {
            var subOrder = await _dbContext.SubOrders
                .Include(so => so.Supplier).ThenInclude(s => s.User)
                .Include(so => so.Designer).ThenInclude(d => d.User)
                .FirstOrDefaultAsync(so => so.SubOrderId == subOrderId);

            if (subOrder == null) return false;

            // Check authorization if userId provided
            if (userId.HasValue)
            {
                bool isAuthorized = false;
                if (subOrder.SupplierId.HasValue && subOrder.Supplier?.User?.UserId == userId.Value)
                    isAuthorized = true;
                else if (subOrder.DesignerId.HasValue && subOrder.Designer?.User?.UserId == userId.Value)
                    isAuthorized = true;

                if (!isAuthorized) return false;
            }

            subOrder.TrackingNumber = trackingNumber;
            if (!string.IsNullOrEmpty(carrier))
                subOrder.ShippingCarrier = carrier;

            // Auto update to shipped if not already
            if (subOrder.Status != SubOrderStatus.Shipped && subOrder.Status != SubOrderStatus.Delivered)
            {
                subOrder.Status = SubOrderStatus.Shipped;
                subOrder.FulfillmentStatus = FulfillmentStatus.Shipped;
                subOrder.ShippedAt = DateTime.UtcNow;
            }

            _dbContext.SubOrders.Update(subOrder);
            await _dbContext.SaveChangesAsync();

            return true;
        }

        // ===== ORDER SPLITTING LOGIC =====

        public async Task<List<SubOrder>> CreateSubOrdersFromOrderAsync(int parentOrderId)
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
                var sellerInfo = await GetSellerInfoAsync(group.Key.SellerId.Value, group.Key.SellerType);
                if (sellerInfo == null) continue;

                // Calculate totals for this sub-order
                var subtotal = group.Sum(od => od.UnitPrice * od.Quantity);
                var shippingFee = CalculateShippingFee(group.ToList()); // You can implement shipping logic
                
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

        // ===== HELPER METHODS =====

        private async Task<SellerInfo?> GetSellerInfoAsync(Guid sellerId, string sellerType)
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

        private decimal CalculateShippingFee(List<OrderDetail> orderDetails)
        {
            // Simple shipping calculation - can be enhanced
            var itemCount = orderDetails.Sum(od => od.Quantity);
            return itemCount <= 3 ? 25000 : 50000; // Base shipping fee logic
        }

        // ===== SUB-ORDER ANALYTICS =====

        public async Task<Dictionary<string, int>> GetSellerSubOrderStatsAsync(Guid sellerId)
        {
            var stats = await _dbContext.SubOrders
                .Where(so => so.SellerId == sellerId)
                .GroupBy(so => so.Status)
                .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
                .ToDictionaryAsync(x => x.Status, x => x.Count);

            return stats;
        }
    }

    // Helper class for seller information
    public class SellerInfo
    {
        public string Name { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
    }
}