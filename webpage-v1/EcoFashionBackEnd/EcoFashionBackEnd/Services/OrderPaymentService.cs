using EcoFashionBackEnd.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

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
                    .FirstOrDefaultAsync(o => o.OrderId == orderId && o.UserId == userId);

                if (order == null || order.PaymentStatus == PaymentStatus.Paid)
                    return false;

                var customerWallet = await _walletService.GetWalletByUserIdAsync(userId);
                if (customerWallet == null || customerWallet.Balance < (double)order.TotalPrice)
                    return false;

                var adminUserId = _configuration.GetValue<int>("AdminUserId", 1);
                var adminWallet = await _walletService.GetWalletByUserIdAsync(adminUserId);
                if (adminWallet == null)
                    return false;

                // Khách hàng trả tiền cho đơn hàng
                await _walletService.CreateTransactionAsync(customerWallet.WalletId, 
                    TransactionType.Payment, -(double)order.TotalPrice, orderId: orderId);

                // Admin nhận tiền từ đơn hàng (thay vì Deposit để phân biệt với nạp tiền VNPay)
                await _walletService.CreateTransactionAsync(adminWallet.WalletId, 
                    TransactionType.PaymentReceived, (double)order.TotalPrice, orderId: orderId);

                order.PaymentStatus = PaymentStatus.Paid;
                order.Status = OrderStatus.processing;

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

        public async Task<bool> PayGroupWithWalletAsync(Guid orderGroupId, int userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                var orders = await _context.Orders
                    .Where(o => o.OrderGroupId == orderGroupId && o.UserId == userId && o.PaymentStatus != PaymentStatus.Paid)
                    .ToListAsync();

                if (!orders.Any())
                    return false;

                var totalAmount = orders.Sum(o => o.TotalPrice);

                var customerWallet = await _walletService.GetWalletByUserIdAsync(userId);
                if (customerWallet == null || customerWallet.Balance < (double)totalAmount)
                    return false;

                var adminUserId = _configuration.GetValue<int>("AdminUserId", 1);
                var adminWallet = await _walletService.GetWalletByUserIdAsync(adminUserId);
                if (adminWallet == null)
                    return false;

                // Khách hàng trả tiền cho nhóm đơn hàng
                await _walletService.CreateTransactionAsync(customerWallet.WalletId, 
                    TransactionType.Payment, -(double)totalAmount);

                // Admin nhận tiền từ nhóm đơn hàng (thay vì Deposit)
                await _walletService.CreateTransactionAsync(adminWallet.WalletId, 
                    TransactionType.PaymentReceived, (double)totalAmount);

                foreach (var order in orders)
                {
                    order.PaymentStatus = PaymentStatus.Paid;
                    order.Status = OrderStatus.processing;
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