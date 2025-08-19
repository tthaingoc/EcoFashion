using EcoFashionBackEnd.Data;
using EcoFashionBackEnd.Models;
using Microsoft.EntityFrameworkCore;

namespace EcoFashionBackEnd.Services
{
    public class OrderPaymentService
    {
        private readonly AppDbContext _context;
        private readonly WalletService _walletService;
        private readonly IConfiguration _configuration;

        public OrderPaymentService(AppDbContext context, WalletService walletService, IConfiguration configuration)
        {
            _context = context;
            _walletService = walletService;
            _configuration = configuration;
        }

        public async Task<bool> PayWithWalletAsync(int orderId, int userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                var order = await _context.Orders
                    .Include(o => o.OrderDetails)
                        .ThenInclude(od => od.Material)
                            .ThenInclude(m => m.Supplier)
                    .Include(o => o.OrderDetails)
                        .ThenInclude(od => od.Product)
                            .ThenInclude(p => p.Designer)
                    .FirstOrDefaultAsync(o => o.OrderId == orderId && o.UserId == userId);

                if (order == null || order.PaymentStatus == "Paid")
                    return false;

                var customerWallet = await _walletService.GetWalletByUserIdAsync(userId);
                if (customerWallet == null || customerWallet.Balance < order.TotalPrice)
                    return false;

                var adminUserId = _configuration.GetValue<int>("AdminUserId", 1);
                var adminWallet = await _walletService.GetWalletByUserIdAsync(adminUserId);
                if (adminWallet == null)
                    return false;

                await _walletService.CreateTransactionAsync(customerWallet.WalletId, 
                    TransactionType.Payment, -order.TotalPrice, orderId: orderId);

                await _walletService.CreateTransactionAsync(adminWallet.WalletId, 
                    TransactionType.Deposit, order.TotalPrice, orderId: orderId);

                order.PaymentStatus = "Paid";
                order.PaymentDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> PayGroupWithWalletAsync(int orderGroupId, int userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                var orders = await _context.Orders
                    .Include(o => o.OrderDetails)
                        .ThenInclude(od => od.Material)
                            .ThenInclude(m => m.Supplier)
                    .Include(o => o.OrderDetails)
                        .ThenInclude(od => od.Product)
                            .ThenInclude(p => p.Designer)
                    .Where(o => o.OrderGroupId == orderGroupId && o.UserId == userId && o.PaymentStatus != "Paid")
                    .ToListAsync();

                if (!orders.Any())
                    return false;

                var totalAmount = orders.Sum(o => o.TotalPrice);

                var customerWallet = await _walletService.GetWalletByUserIdAsync(userId);
                if (customerWallet == null || customerWallet.Balance < totalAmount)
                    return false;

                var adminUserId = _configuration.GetValue<int>("AdminUserId", 1);
                var adminWallet = await _walletService.GetWalletByUserIdAsync(adminUserId);
                if (adminWallet == null)
                    return false;

                await _walletService.CreateTransactionAsync(customerWallet.WalletId, 
                    TransactionType.Payment, -totalAmount);

                await _walletService.CreateTransactionAsync(adminWallet.WalletId, 
                    TransactionType.Deposit, totalAmount);

                foreach (var order in orders)
                {
                    order.PaymentStatus = "Paid";
                    order.PaymentDate = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}