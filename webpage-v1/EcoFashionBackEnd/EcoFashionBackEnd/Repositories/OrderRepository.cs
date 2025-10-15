using EcoFashionBackEnd.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace EcoFashionBackEnd.Repositories;

public class OrderRepository : GenericRepository<Order, int>, IOrderRepository
{
    private readonly AppDbContext _dbContext;

    public OrderRepository(AppDbContext dbContext) : base(dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<Order>> GetAllOrdersWithUserAsync()
    {
        return await _dbContext.Orders
            .Include(o => o.User)
            .ToListAsync();
    }

    public async Task<List<Order>> GetOrdersByUserIdWithUserAsync(int userId)
    {
        return await _dbContext.Orders
            .Where(o => o.UserId == userId)
            .Include(o => o.User)
            .ToListAsync();
    }

    public async Task<Order?> GetOrderByIdWithUserAsync(int id)
    {
        return await _dbContext.Orders
            .Include(o => o.User)
            .FirstOrDefaultAsync(o => o.OrderId == id);
    }

    public async Task<List<OrderDetail>> GetOrderDetailsByOrderIdAsync(int orderId)
    {
        return await _dbContext.OrderDetails
            .Where(od => od.OrderId == orderId)
            .ToListAsync();
    }

    public async Task<Designer?> GetDesignerByUserIdAsync(int userId)
    {
        return await _dbContext.Designers
            .FirstOrDefaultAsync(d => d.UserId == userId);
    }

    public async Task<Designer?> GetDesignerByIdAsync(Guid designerId)
    {
        return await _dbContext.Designers
            .Where(d => d.DesignerId == designerId)
            .FirstOrDefaultAsync();
    }

    public async Task<Supplier?> GetSupplierByIdAsync(Guid supplierId)
    {
        return await _dbContext.Suppliers
            .Where(s => s.SupplierId == supplierId)
            .FirstOrDefaultAsync();
    }

    public async Task<List<UserAddress>> GetUserAddressesByUserIdAsync(int userId)
    {
        return await _dbContext.UserAddresses
            .AsNoTracking()
            .Where(ua => ua.UserId == userId)
            .ToListAsync();
    }

    public async Task<Wallet?> GetWalletByUserIdAsync(int userId)
    {
        return await _dbContext.Wallets
            .FirstOrDefaultAsync(w => w.UserId == userId);
    }

    public async Task AddWalletAsync(Wallet wallet)
    {
        _dbContext.Wallets.Add(wallet);
        await _dbContext.SaveChangesAsync();
    }

    public async Task AddWalletTransactionAsync(WalletTransaction transaction)
    {
        _dbContext.WalletTransactions.Add(transaction);
        await Task.CompletedTask;
    }

    public async Task<List<int>> GetOrderIdsBySellerIdAsync(Guid sellerId)
    {
        return await _dbContext.OrderDetails
            .Where(od => od.SupplierId == sellerId || od.DesignerId == sellerId)
            .Select(od => od.OrderId)
            .Distinct()
            .ToListAsync();
    }

    public async Task<List<Order>> GetOrdersByIdsWithUserAsync(List<int> orderIds)
    {
        return await _dbContext.Orders
            .Where(o => orderIds.Contains(o.OrderId))
            .Include(o => o.User)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();
    }

    public async Task<Order?> GetOrderByIdAsync(int orderId)
    {
        return await _dbContext.Orders.FindAsync(orderId);
    }

    public async Task SaveChangesAsync()
    {
        await _dbContext.SaveChangesAsync();
    }

    // OrderPaymentService methods
    public async Task<IDbContextTransaction> BeginTransactionAsync()
    {
        return await _dbContext.Database.BeginTransactionAsync();
    }

    public async Task<Order?> GetOrderByIdAndUserIdAsync(int orderId, int userId)
    {
        return await _dbContext.Orders
            .FirstOrDefaultAsync(o => o.OrderId == orderId && o.UserId == userId);
    }

    public async Task<List<Order>> GetUnpaidOrdersByGroupIdAndUserIdAsync(Guid orderGroupId, int userId)
    {
        return await _dbContext.Orders
            .Where(o => o.OrderGroupId == orderGroupId && o.UserId == userId && o.PaymentStatus != PaymentStatus.Paid)
            .ToListAsync();
    }

    public async Task<bool> HasMaterialStockTransactionAsync(int orderId)
    {
        return await _dbContext.MaterialStockTransactions
            .AnyAsync(t => t.ReferenceId == orderId.ToString() &&
                          t.TransactionType == MaterialTransactionType.CustomerSale &&
                          (t.ReferenceType == "WalletPayment" || t.ReferenceType == "OrderPayment"));
    }

    public async Task<List<OrderDetail>> GetMaterialOrderDetailsWithIncludesAsync(int orderId)
    {
        return await _dbContext.OrderDetails
            .Include(od => od.Material)
            .ThenInclude(m => m.Supplier)
            .Where(od => od.OrderId == orderId && od.Type == OrderDetailType.material && od.MaterialId.HasValue)
            .ToListAsync();
    }

    public async Task<List<OrderDetail>> GetProductOrderDetailsWithIncludesAsync(int orderId)
    {
        return await _dbContext.OrderDetails
            .Include(od => od.Product)
                .ThenInclude(p => p.Design)
            .Where(od => od.OrderId == orderId && od.Type == OrderDetailType.product && od.ProductId.HasValue)
            .ToListAsync();
    }

    public async Task<Warehouse?> GetDefaultMaterialWarehouseAsync(Guid supplierId)
    {
        return await _dbContext.Warehouses
            .FirstOrDefaultAsync(w => w.SupplierId == supplierId && w.IsDefault && w.IsActive && w.WarehouseType == "Material");
    }

    public async Task<Warehouse?> GetProductWarehouseAsync(Guid designerId)
    {
        return await _dbContext.Warehouses
            .FirstOrDefaultAsync(w => w.DesignerId == designerId && w.IsActive && w.WarehouseType == "Product");
    }

    public async Task<ProductInventory?> GetProductInventoryAsync(int productId, int warehouseId)
    {
        return await _dbContext.ProductInventories
            .FirstOrDefaultAsync(pi => pi.ProductId == productId && pi.WarehouseId == warehouseId);
    }

    public async Task UpdateProductInventoryAsync(ProductInventory inventory)
    {
        _dbContext.ProductInventories.Update(inventory);
        await _dbContext.SaveChangesAsync();
    }

    public async Task AddProductInventoryTransactionAsync(ProductInventoryTransaction transaction)
    {
        _dbContext.ProductInventoryTransactions.Add(transaction);
        await _dbContext.SaveChangesAsync();
    }
}
