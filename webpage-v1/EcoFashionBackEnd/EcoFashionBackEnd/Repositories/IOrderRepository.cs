using EcoFashionBackEnd.Entities;
using Microsoft.EntityFrameworkCore.Storage;

namespace EcoFashionBackEnd.Repositories;

public interface IOrderRepository : IRepository<Order, int>
{
    Task<List<Order>> GetAllOrdersWithUserAsync();
    Task<List<Order>> GetOrdersByUserIdWithUserAsync(int userId);
    Task<Order?> GetOrderByIdWithUserAsync(int id);
    Task<List<OrderDetail>> GetOrderDetailsByOrderIdAsync(int orderId);
    Task<Designer?> GetDesignerByUserIdAsync(int userId);
    Task<Designer?> GetDesignerByIdAsync(Guid designerId);
    Task<Supplier?> GetSupplierByIdAsync(Guid supplierId);
    Task<List<UserAddress>> GetUserAddressesByUserIdAsync(int userId);
    Task<Wallet?> GetWalletByUserIdAsync(int userId);
    Task AddWalletAsync(Wallet wallet);
    Task AddWalletTransactionAsync(WalletTransaction transaction);
    Task<List<int>> GetOrderIdsBySellerIdAsync(Guid sellerId);
    Task<List<Order>> GetOrdersByIdsWithUserAsync(List<int> orderIds);
    Task<Order?> GetOrderByIdAsync(int orderId);
    Task SaveChangesAsync();

    // OrderPaymentService methods
    Task<IDbContextTransaction> BeginTransactionAsync();
    Task<Order?> GetOrderByIdAndUserIdAsync(int orderId, int userId);
    Task<List<Order>> GetUnpaidOrdersByGroupIdAndUserIdAsync(Guid orderGroupId, int userId);
    Task<bool> HasMaterialStockTransactionAsync(int orderId);
    Task<List<OrderDetail>> GetMaterialOrderDetailsWithIncludesAsync(int orderId);
    Task<List<OrderDetail>> GetProductOrderDetailsWithIncludesAsync(int orderId);
    Task<Warehouse?> GetDefaultMaterialWarehouseAsync(Guid supplierId);
    Task<Warehouse?> GetProductWarehouseAsync(Guid designerId);
    Task<ProductInventory?> GetProductInventoryAsync(int productId, int warehouseId);
    Task UpdateProductInventoryAsync(ProductInventory inventory);
    Task AddProductInventoryTransactionAsync(ProductInventoryTransaction transaction);
}
