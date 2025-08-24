using AutoMapper;
using EcoFashionBackEnd.Common.Payloads.Requests;
using EcoFashionBackEnd.Common.Payloads.Responses;
using EcoFashionBackEnd.Dtos;
using EcoFashionBackEnd.Entities;
using EcoFashionBackEnd.Repositories;
using Microsoft.EntityFrameworkCore;

namespace EcoFashionBackEnd.Services;

public class OrderDetailService
{
    private readonly IRepository<OrderDetail, int> _orderDetailRepository;
    private readonly AppDbContext _dbContext;
    private readonly IMapper _mapper;
    public OrderDetailService(IRepository<OrderDetail, int> repository, IMapper mapper, AppDbContext context)
    {
        _orderDetailRepository = repository;
        _dbContext = context;
        _mapper = mapper;
    }
    public async Task<IEnumerable<OrderDetailModel>> GetAllOrderDetailAsync()
    {
        var orderDetails = await _dbContext.OrderDetails
            .Include(od => od.Order)
            .Include(od => od.Designer)
            .Include(od => od.Material).ThenInclude(m => m.MaterialImages)
                .ThenInclude(mi => mi.Image)
            .Include(od => od.Product).ThenInclude(p => p.Design).ThenInclude(d => d.DesignerProfile)
            .Include(od => od.Product).ThenInclude(p => p.Design).ThenInclude(d => d.DesignImages).ThenInclude(di => di.Image)
            .Include(od => od.Supplier)
            .ToListAsync();
        var result = orderDetails.Select(od =>
        {
            string itemName;
            string providerName;
            string? imageUrl = null;

            if (od.Type == OrderDetailType.material && od.Material != null)
            {
                itemName = od.Material.Name ?? "Không có tên chất liệu";
                providerName = od.Supplier?.SupplierName ?? "Nhà cung cấp không tồn tại";
                imageUrl = od.Material.MaterialImages.FirstOrDefault()?.Image?.ImageUrl;
            }
            else if (od.Type == OrderDetailType.product && od.Product != null)
            {
                itemName = od.Product.Design?.Name ?? "Không có tên sản phẩm";
                providerName = od.Product.Design?.DesignerProfile?.DesignerName ?? "Nhà thiết kế không tồn tại";
                imageUrl = od.Product.Design?.DesignImages?.FirstOrDefault()?.Image?.ImageUrl;
            }
            else
            {
                // Fallback: unknown type or corrupted data
                itemName = "Không xác định";
                providerName = "Không xác định";
            }

            return new OrderDetailModel
            {
                OrderDetailId = od.OrderDetailId,
                OrderId = od.OrderId,
                Quantity = od.Quantity,
                UnitPrice = od.UnitPrice,
                Type = od.Type.ToString(),
                Status = od.Status.ToString(),

                MaterialId = od.Type == OrderDetailType.material ? od.MaterialId : 0,
                ProductId = od.Type == OrderDetailType.product ? od.ProductId : null,
                SupplierId = od.Type == OrderDetailType.material ? od.SupplierId : null,

                ItemName = itemName,
                ProviderName = providerName,
                ImageUrl = imageUrl
            };
        });

        return result;
    }
    public async Task<OrderDetailModel?> GetOrderDetailByIdAsync(int id)
    {
        var od = await _dbContext.OrderDetails
            .Include(o => o.Order)
            .Include(o => o.Designer)
            .Include(o => o.Material).ThenInclude(m => m.MaterialImages).ThenInclude(mi => mi.Image)
            .Include(o => o.Product).ThenInclude(p => p.Design).ThenInclude(d => d.DesignerProfile)
            .Include(o => o.Product).ThenInclude(p => p.Design).ThenInclude(d => d.DesignImages).ThenInclude(di => di.Image)
            .Include(o => o.Supplier)
            .FirstOrDefaultAsync(o => o.OrderDetailId == id);

        if (od == null)
            return null;

        string itemName = "Không xác định";
        string providerName = "Không xác định";
        string? imageUrl = null;

        if (od.Type == OrderDetailType.material && od.Material != null)
        {
            itemName = od.Material?.Name ?? "Không có tên chất liệu";
            providerName = od.Supplier?.SupplierName ?? "Nhà cung cấp không tồn tại";
            imageUrl = od.Material?.MaterialImages.FirstOrDefault()?.Image?.ImageUrl;
        }
        else if (od.Type == OrderDetailType.product && od.Product != null)
        {
            itemName = od.Product?.Design?.Name ?? "Không có tên sản phẩm";
            providerName = od.Product?.Design?.DesignerProfile?.DesignerName ?? "Nhà thiết kế không tồn tại";
            imageUrl = od.Product?.Design?.DesignImages?.FirstOrDefault()?.Image?.ImageUrl;
        }

        return new OrderDetailModel
        {
            OrderDetailId = od.OrderDetailId,
            OrderId = od.OrderId,
            Quantity = od.Quantity,
            UnitPrice = od.UnitPrice,
            Type = od.Type.ToString(),
            Status = od.Status.ToString(),

            MaterialId = od.Type == OrderDetailType.material ? od.MaterialId : null,
            ProductId = od.Type == OrderDetailType.product ? od.ProductId : null,
            SupplierId = od.Type == OrderDetailType.material ? od.SupplierId : null,

            ItemName = itemName,
            ProviderName = providerName,
            ImageUrl = imageUrl
        };
    }
    public async Task<int> CreateOrderDetailAsync(int userId, CreateOrderDetailRequest request)
    {
        // Kiểm tra loại đơn hàng hợp lệ: Material hoặc Product
        if (request.Type == OrderDetailType.material && request.MaterialId == null)
            throw new ArgumentException("Chất liệu không được để trống khi loại là 'material'.");
        if (request.Type == OrderDetailType.product && request.DesignId == null)
            throw new ArgumentException("Sản phẩm không được để trống khi loại là 'product'.");
        var orderDetail = _mapper.Map<OrderDetail>(request);
        _dbContext.OrderDetails.Add(orderDetail);
        await _dbContext.SaveChangesAsync();
        return orderDetail.OrderDetailId;
    }
    public async Task<bool> UpdateOrderDetailAsync(int orderDetailId, UpdateOrderDetailRequest request)
    {
        var orderDetail = await _orderDetailRepository.GetByIdAsync(orderDetailId);
        if (orderDetail == null) return false;
        if (request.Quantity.HasValue)
            orderDetail.Quantity = request.Quantity.Value;
        if (request.UnitPrice.HasValue)
            orderDetail.UnitPrice = request.UnitPrice.Value;
        if (!string.IsNullOrWhiteSpace(request.Status))
            if (Enum.TryParse<OrderDetailStatus>(request.Status, true, out var parsedStatus))
                orderDetail.Status = parsedStatus;
            else
                throw new ArgumentException("Trạng thái chi tiết đơn hàng không hợp lệ");
        _orderDetailRepository.Update(orderDetail);
        var result = await _dbContext.SaveChangesAsync();
        return result > 0;
    }
    public async Task<bool> DeleteOrderDetailAsync(int orderDetailId)
    {
        var orderDetail = await _orderDetailRepository.GetByIdAsync(orderDetailId);
        if (orderDetail == null) return false;
        _orderDetailRepository.Remove(orderDetailId);
        var result = await _dbContext.SaveChangesAsync();
        return result > 0;
    }

    // ===== NEW METHODS FOR PARTIAL FULFILLMENT SYSTEM =====

    // Get order details by seller (supplier or designer)
    public async Task<IEnumerable<OrderDetailModel>> GetOrderDetailsBySellerAsync(Guid sellerId)
    {
        var orderDetails = await _dbContext.OrderDetails
            .Include(od => od.Order).ThenInclude(o => o.User)
            .Include(od => od.Designer)
            .Include(od => od.Material).ThenInclude(m => m.MaterialImages).ThenInclude(mi => mi.Image)
            .Include(od => od.Product).ThenInclude(p => p.Design).ThenInclude(d => d.DesignerProfile)
            .Include(od => od.Product).ThenInclude(p => p.Design).ThenInclude(d => d.DesignImages).ThenInclude(di => di.Image)
            .Include(od => od.Supplier)
            .Where(od => od.SupplierId == sellerId || od.DesignerId == sellerId)
            .Where(od => od.Order.PaymentStatus == PaymentStatus.Paid)
            .OrderByDescending(od => od.Order.OrderDate)
            .ToListAsync();

        return orderDetails.Select(MapOrderDetailToModel);
    }

    // Helper method to map OrderDetail to OrderDetailModel
    private OrderDetailModel MapOrderDetailToModel(OrderDetail od)
    {
        string itemName;
        string providerName;
        string? imageUrl = null;

        if (od.Type == OrderDetailType.material && od.Material != null)
        {
            itemName = od.Material.Name ?? "Không có tên chất liệu";
            providerName = od.Supplier?.SupplierName ?? "Nhà cung cấp không tồn tại";
            imageUrl = od.Material.MaterialImages.FirstOrDefault()?.Image?.ImageUrl;
        }
        else if (od.Type == OrderDetailType.product && od.Product != null)
        {
            itemName = od.Product.Design?.Name ?? "Không có tên sản phẩm";
            providerName = od.Product.Design?.DesignerProfile?.DesignerName ?? "Nhà thiết kế không tồn tại";
            imageUrl = od.Product.Design?.DesignImages?.FirstOrDefault()?.Image?.ImageUrl;
        }
        else
        {
            itemName = "Không xác định";
            providerName = "Không xác định";
        }

        return new OrderDetailModel
        {
            OrderDetailId = od.OrderDetailId,
            OrderId = od.OrderId,
            Quantity = od.Quantity,
            UnitPrice = od.UnitPrice,
            Type = od.Type.ToString(),
            Status = od.Status.ToString(),

            MaterialId = od.Type == OrderDetailType.material ? od.MaterialId : 0,
            ProductId = od.Type == OrderDetailType.product ? od.ProductId : null,
            SupplierId = od.Type == OrderDetailType.material ? od.SupplierId : null,

            ItemName = itemName,
            ProviderName = providerName,
            ImageUrl = imageUrl
        };
    }

    // Get seller-specific view of an order
    public async Task<OrderSellerViewModel?> GetOrderSellerViewAsync(int orderId, Guid sellerId)
    {
        var order = await _dbContext.Orders
            .Include(o => o.User)
            .FirstOrDefaultAsync(o => o.OrderId == orderId && o.PaymentStatus == PaymentStatus.Paid);

        if (order == null) return null;

        // Get seller's items in this order
        var sellerItems = await _dbContext.OrderDetails
            .Include(od => od.Designer)
            .Include(od => od.Material).ThenInclude(m => m.MaterialImages).ThenInclude(mi => mi.Image)
            .Include(od => od.Product).ThenInclude(p => p.Design)
            .Include(od => od.Supplier)
            .Where(od => od.OrderId == orderId && (od.SupplierId == sellerId || od.DesignerId == sellerId))
            .ToListAsync();

        if (!sellerItems.Any()) return null;

        // Get all other sellers in this order
        var allOrderDetails = await _dbContext.OrderDetails
            .Include(od => od.Designer)
            .Include(od => od.Supplier)
            .Where(od => od.OrderId == orderId)
            .ToListAsync();

        var otherSellers = GetOtherSellersInfo(allOrderDetails, sellerId);

        return new OrderSellerViewModel
        {
            OrderId = order.OrderId,
            UserName = order.User?.FullName ?? "Unknown",
            ShippingAddress = order.ShippingAddress,
            TotalPrice = order.TotalPrice,
            OrderDate = order.OrderDate.ToString("yyyy-MM-dd HH:mm:ss"),
            PaymentStatus = order.PaymentStatus.ToString(),
            OrderStatus = order.Status.ToString(),
            FulfillmentStatus = order.FulfillmentStatus.ToString(),
            SellerItems = sellerItems.Select(MapToSellerOrderDetail).ToList(),
            OtherSellers = otherSellers,
            TotalItemsInOrder = allOrderDetails.Count,
            SellerItemsCount = sellerItems.Count,
            ConfirmedSellerItems = sellerItems.Count(si => si.Status == OrderDetailStatus.confirmed),
            AllSellerItemsConfirmed = sellerItems.All(si => si.Status == OrderDetailStatus.confirmed)
        };
    }

    // Update individual order detail status
    public async Task<bool> UpdateOrderDetailStatusAsync(int orderDetailId, UpdateOrderDetailStatusRequest request, int userId)
    {
        var orderDetail = await _dbContext.OrderDetails
            .Include(od => od.Order)
            .Include(od => od.Supplier).ThenInclude(s => s.User)
            .Include(od => od.Designer).ThenInclude(d => d.User)
            .FirstOrDefaultAsync(od => od.OrderDetailId == orderDetailId);

        if (orderDetail == null) return false;

        // Check authorization - user must own the supplier/designer profile
        bool isAuthorized = false;
        if (orderDetail.SupplierId.HasValue && orderDetail.Supplier?.User?.UserId == userId)
            isAuthorized = true;
        else if (orderDetail.DesignerId.HasValue && orderDetail.Designer?.User?.UserId == userId)
            isAuthorized = true;

        if (!isAuthorized) return false;

        // Update status
        orderDetail.Status = request.Status;
        
        _dbContext.OrderDetails.Update(orderDetail);
        await _dbContext.SaveChangesAsync();

        // Recalculate order fulfillment status
        await RecalculateOrderFulfillmentStatusAsync(orderDetail.OrderId);

        return true;
    }

    // Bulk confirm all seller items in an order
    public async Task<bool> ConfirmAllSellerItemsAsync(int orderId, Guid sellerId, BulkConfirmRequest request, int userId)
    {
        var sellerItems = await _dbContext.OrderDetails
            .Include(od => od.Order)
            .Include(od => od.Supplier).ThenInclude(s => s.User)
            .Include(od => od.Designer).ThenInclude(d => d.User)
            .Where(od => od.OrderId == orderId && (od.SupplierId == sellerId || od.DesignerId == sellerId))
            .ToListAsync();

        if (!sellerItems.Any()) return false;

        // Check authorization for at least one item
        bool isAuthorized = sellerItems.Any(item =>
            (item.SupplierId.HasValue && item.Supplier?.User?.UserId == userId) ||
            (item.DesignerId.HasValue && item.Designer?.User?.UserId == userId));

        if (!isAuthorized) return false;

        // Update all seller items to confirmed status
        foreach (var item in sellerItems)
        {
            if (item.Status == OrderDetailStatus.pending)
            {
                item.Status = OrderDetailStatus.confirmed;
            }
        }

        _dbContext.OrderDetails.UpdateRange(sellerItems);
        await _dbContext.SaveChangesAsync();

        // Recalculate order fulfillment status
        await RecalculateOrderFulfillmentStatusAsync(orderId);

        return true;
    }

    // Get order progress for customer view
    public async Task<OrderProgressModel?> GetOrderProgressAsync(int orderId)
    {
        var order = await _dbContext.Orders
            .Include(o => o.User)
            .FirstOrDefaultAsync(o => o.OrderId == orderId);

        if (order == null) return null;

        var orderDetails = await _dbContext.OrderDetails
            .Include(od => od.Designer)
            .Include(od => od.Supplier)
            .Include(od => od.Material).ThenInclude(m => m.MaterialImages).ThenInclude(mi => mi.Image)
            .Include(od => od.Product).ThenInclude(p => p.Design)
            .Where(od => od.OrderId == orderId)
            .ToListAsync();

        var confirmedCount = orderDetails.Count(od => od.Status == OrderDetailStatus.confirmed || od.Status == OrderDetailStatus.shipping);
        var shippingCount = orderDetails.Count(od => od.Status == OrderDetailStatus.shipping);

        // Group by sellers
        var sellerGroups = orderDetails
            .GroupBy(od => new
            {
                SellerId = od.SupplierId ?? od.DesignerId,
                SellerType = od.SupplierId.HasValue ? "Supplier" : "Designer",
                SellerName = od.SupplierId.HasValue ? od.Supplier?.SupplierName : od.Designer?.DesignerName,
                AvatarUrl = od.SupplierId.HasValue ? od.Supplier?.AvatarUrl : od.Designer?.AvatarUrl
            })
            .Select(g => new SellerProgress
            {
                SellerId = g.Key.SellerId ?? Guid.Empty,
                SellerName = g.Key.SellerName ?? "Unknown",
                SellerType = g.Key.SellerType,
                AvatarUrl = g.Key.AvatarUrl,
                TotalItems = g.Count(),
                ConfirmedItems = g.Count(od => od.Status == OrderDetailStatus.confirmed || od.Status == OrderDetailStatus.shipping),
                ShippedItems = g.Count(od => od.Status == OrderDetailStatus.shipping),
                Status = GetSellerStatus(g.ToList()),
                Progress = (double)g.Count(od => od.Status == OrderDetailStatus.confirmed || od.Status == OrderDetailStatus.shipping) / g.Count() * 100,
                Items = g.Select(od => new ItemProgress
                {
                    OrderDetailId = od.OrderDetailId,
                    ItemName = GetItemName(od),
                    ItemType = od.Type.ToString(),
                    Quantity = od.Quantity,
                    Status = od.Status.ToString(),
                    ImageUrl = GetItemImageUrl(od)
                }).ToList()
            })
            .ToList();

        return new OrderProgressModel
        {
            OrderId = order.OrderId,
            UserName = order.User?.FullName ?? "Unknown",
            TotalPrice = order.TotalPrice,
            OrderDate = order.OrderDate.ToString("yyyy-MM-dd HH:mm:ss"),
            PaymentStatus = order.PaymentStatus.ToString(),
            FulfillmentStatus = order.FulfillmentStatus.ToString(),
            TotalItems = orderDetails.Count,
            ConfirmedItems = confirmedCount,
            ShippedItems = shippingCount,
            DeliveredItems = 0, // Will be implemented when delivery tracking is added
            ConfirmationProgress = (double)confirmedCount / orderDetails.Count * 100,
            ShippingProgress = (double)shippingCount / orderDetails.Count * 100,
            DeliveryProgress = 0, // Will be implemented later
            SellerProgressList = sellerGroups
        };
    }

    // Helper method to recalculate order fulfillment status
    private async Task RecalculateOrderFulfillmentStatusAsync(int orderId)
    {
        var order = await _dbContext.Orders.FindAsync(orderId);
        if (order == null) return;

        var orderDetails = await _dbContext.OrderDetails
            .Where(od => od.OrderId == orderId)
            .ToListAsync();

        if (orderDetails.Count == 0) return;

        var confirmedCount = orderDetails.Count(od => od.Status == OrderDetailStatus.confirmed || od.Status == OrderDetailStatus.shipping);
        var shippingCount = orderDetails.Count(od => od.Status == OrderDetailStatus.shipping);
        var totalCount = orderDetails.Count;

        FulfillmentStatus newStatus;

        if (confirmedCount == 0)
        {
            newStatus = FulfillmentStatus.None;
        }
        else if (confirmedCount == totalCount)
        {
            if (shippingCount == totalCount)
            {
                newStatus = FulfillmentStatus.Shipped;
            }
            else if (shippingCount > 0)
            {
                newStatus = FulfillmentStatus.PartiallyShipped;
            }
            else
            {
                newStatus = FulfillmentStatus.Processing;
            }
        }
        else
        {
            newStatus = FulfillmentStatus.PartiallyConfirmed;
        }

        if (order.FulfillmentStatus != newStatus)
        {
            order.FulfillmentStatus = newStatus;
            _dbContext.Orders.Update(order);
            await _dbContext.SaveChangesAsync();
        }
    }

    // Helper methods
    private List<OtherSellerInfo> GetOtherSellersInfo(List<OrderDetail> allOrderDetails, Guid currentSellerId)
    {
        return allOrderDetails
            .Where(od => od.SupplierId != currentSellerId && od.DesignerId != currentSellerId)
            .GroupBy(od => new
            {
                SellerId = od.SupplierId ?? od.DesignerId,
                SellerType = od.SupplierId.HasValue ? "Supplier" : "Designer",
                SellerName = od.SupplierId.HasValue ? od.Supplier?.SupplierName : od.Designer?.DesignerName,
                AvatarUrl = od.SupplierId.HasValue ? od.Supplier?.AvatarUrl : od.Designer?.AvatarUrl
            })
            .Select(g => new OtherSellerInfo
            {
                SellerId = g.Key.SellerId ?? Guid.Empty,
                SellerName = g.Key.SellerName ?? "Unknown",
                SellerType = g.Key.SellerType,
                ItemCount = g.Count(),
                ConfirmedItems = g.Count(od => od.Status == OrderDetailStatus.confirmed),
                AllItemsConfirmed = g.All(od => od.Status == OrderDetailStatus.confirmed),
                AvatarUrl = g.Key.AvatarUrl
            })
            .ToList();
    }

    private SellerOrderDetailModel MapToSellerOrderDetail(OrderDetail od)
    {
        return new SellerOrderDetailModel
        {
            OrderDetailId = od.OrderDetailId,
            ItemName = GetItemName(od),
            ItemType = od.Type.ToString(),
            Quantity = od.Quantity,
            UnitPrice = od.UnitPrice,
            TotalPrice = od.UnitPrice * od.Quantity,
            Status = od.Status.ToString(),
            ImageUrl = GetItemImageUrl(od),
            CanConfirm = od.Status == OrderDetailStatus.pending,
            CanShip = od.Status == OrderDetailStatus.confirmed
        };
    }

    private string GetItemName(OrderDetail od)
    {
        return od.Type switch
        {
            OrderDetailType.material => od.Material?.Name ?? "Material",
            OrderDetailType.design => od.Design?.Name ?? "Design",
            OrderDetailType.product => od.Product?.Design?.Name ?? "Product",
            _ => "Unknown Item"
        };
    }

    private string? GetItemImageUrl(OrderDetail od)
    {
        return od.Type switch
        {
            OrderDetailType.material => od.Material?.MaterialImages?.FirstOrDefault()?.Image?.ImageUrl,
            OrderDetailType.design => od.Design?.DesignImages?.FirstOrDefault()?.Image?.ImageUrl,
            OrderDetailType.product => od.Product?.Design?.DesignImages?.FirstOrDefault()?.Image?.ImageUrl,
            _ => null
        };
    }

    private string GetSellerStatus(List<OrderDetail> items)
    {
        if (items.All(i => i.Status == OrderDetailStatus.shipping))
            return "Shipped";
        else if (items.All(i => i.Status == OrderDetailStatus.confirmed || i.Status == OrderDetailStatus.shipping))
            return "Confirmed";
        else if (items.Any(i => i.Status == OrderDetailStatus.confirmed || i.Status == OrderDetailStatus.shipping))
            return "Partially Confirmed";
        else
            return "Pending";
    }
}
