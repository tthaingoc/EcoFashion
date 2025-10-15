using EcoFashionBackEnd.Entities;
using EcoFashionBackEnd.Repositories;
using Microsoft.Extensions.Configuration;

namespace EcoFashionBackEnd.Services
{
    public class OrderPaymentService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly WalletService _walletService;
        private readonly IConfiguration _configuration;
        private readonly MaterialInventoryService _materialInventoryService;
        private readonly SettlementService _settlementService;

        public OrderPaymentService(
            IOrderRepository orderRepository,
            WalletService walletService,
            IConfiguration configuration,
            MaterialInventoryService materialInventoryService,
            SettlementService settlementService)
        {
            _orderRepository = orderRepository;
            _walletService = walletService;
            _configuration = configuration;
            _materialInventoryService = materialInventoryService;
            _settlementService = settlementService;
        }

        public async Task<bool> PayWithWalletAsync(int orderId, int userId)
        {
            using var transaction = await _orderRepository.BeginTransactionAsync();

            try
            {
                var order = await _orderRepository.GetOrderByIdAndUserIdAsync(orderId, userId);

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

                // Lưu thay đổi trước khi trừ kho
                await _orderRepository.SaveChangesAsync();

                // TRỪ KHO NGAY SAU KHI CHUYỂN SANG PROCESSING
                await DeductInventoryForOrderAsync(orderId);

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
            using var transaction = await _orderRepository.BeginTransactionAsync();

            try
            {
                var orders = await _orderRepository.GetUnpaidOrdersByGroupIdAndUserIdAsync(orderGroupId, userId);

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

                // Tạo description chi tiết cho giao dịch nhóm đơn hàng
                var orderDetails = orders.Select(o => $"orderId: {o.OrderId}, số tiền: {o.TotalPrice:N0}").ToList();
                var groupDescription = $"Thanh toán cho {orders.Count} đơn hàng có {string.Join("; ", orderDetails)}";

                // Khách hàng trả tiền cho nhóm đơn hàng với description chi tiết
                await _walletService.CreateTransactionAsync(customerWallet.WalletId,
                    TransactionType.Payment, -(double)totalAmount, orderGroupId: orderGroupId, description: groupDescription);

                // Admin nhận tiền từ nhóm đơn hàng (thay vì Deposit)
                await _walletService.CreateTransactionAsync(adminWallet.WalletId,
                    TransactionType.PaymentReceived, (double)totalAmount, orderGroupId: orderGroupId, description: groupDescription);

                // Cập nhật status cho tất cả orders
                foreach (var order in orders)
                {
                    order.PaymentStatus = PaymentStatus.Paid;
                    order.Status = OrderStatus.processing;
                }

                // Lưu thay đổi trước khi trừ kho
                await _orderRepository.SaveChangesAsync();

                // TRỪ KHO CHO TẤT CẢ ORDERS TRONG NHÓM
                foreach (var order in orders)
                {
                    await DeductInventoryForOrderAsync(order.OrderId);
                }

                await transaction.CommitAsync();

                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        /// <summary>
        /// Helper method: Trừ inventory cho tất cả materials trong order khi payment thành công
        /// </summary>
        /// <param name="orderId">ID của order đã thanh toán thành công</param>
        /// <returns>True nếu trừ kho thành công</returns>
        private async Task<bool> DeductInventoryForOrderAsync(int orderId)
        {
            try
            {
                // Kiểm tra xem đã trừ kho cho order này chưa (tránh trùng lập)
                var existingDeduction = await _orderRepository.HasMaterialStockTransactionAsync(orderId);

                if (existingDeduction)
                {
                    Console.WriteLine($"⚠️ Inventory already deducted for OrderId {orderId}. Skipping duplicate deduction.");
                    //return true;
                }

                // Lấy tất cả order details có MaterialId (loại material, không phải design)
                var materialOrderDetails = await _orderRepository.GetMaterialOrderDetailsWithIncludesAsync(orderId);

                if (!materialOrderDetails.Any())
                {
                    Console.WriteLine($"No material order details found for OrderId {orderId}. Skipping inventory deduction.");
                    //return true; // Không có material nào cần trừ
                }

                foreach (var orderDetail in materialOrderDetails)
                {
                    var materialId = orderDetail.MaterialId!.Value;
                    var quantity = orderDetail.Quantity;
                    var supplierId = orderDetail.Material!.SupplierId;

                    // Tìm warehouse mặc định của supplier (đúng loại kho Material)
                    var warehouse = await _orderRepository.GetDefaultMaterialWarehouseAsync(supplierId);

                    if (warehouse == null)
                    {
                        Console.WriteLine($"WARNING: No default warehouse found for SupplierId {supplierId}. Skipping deduction for MaterialId {materialId}");
                        continue;
                    }

                    // Trừ inventory sử dụng MaterialInventoryService
                    await _materialInventoryService.CreateTransactionAsync(
                        materialId: materialId,
                        warehouseId: warehouse.WarehouseId,
                        transactionType: MaterialTransactionType.CustomerSale,
                        quantityChange: -quantity, // Số âm cho việc bán
                        unit: "mét", // Default unit cho material
                        note: $"Trừ kho cho đơn hàng #{orderId} - Thanh toán ví thành công",
                        referenceType: "WalletPayment",
                        referenceId: orderId.ToString(),
                        userId: null // System operation
                    );

                    Console.WriteLine($"✅ Successfully deducted {quantity} units of MaterialId {materialId} from WarehouseId {warehouse.WarehouseId} for OrderId {orderId}");
                }

                // Tiếp tục: Trừ kho sản phẩm của Designer (OrderDetail.Type == product)
                var productOrderDetails = await _orderRepository.GetProductOrderDetailsWithIncludesAsync(orderId);

                if (productOrderDetails.Any())
                {
                    foreach (var orderDetail in productOrderDetails)
                    {
                        var productId = orderDetail.ProductId!.Value;
                        var quantity = orderDetail.Quantity;
                        var designerId = orderDetail.Product!.Design.DesignerId;

                        // Tìm warehouse mặc định của designer cho sản phẩm
                        var productWarehouse = await _orderRepository.GetProductWarehouseAsync(designerId);

                        if (productWarehouse == null)
                        {
                            Console.WriteLine($"WARNING: No default product warehouse found for DesignerId {designerId}. Skipping product deduction for ProductId {productId}");
                            continue;
                        }

                        var productInventory = await _orderRepository.GetProductInventoryAsync(productId, productWarehouse.WarehouseId);

                        if (productInventory == null)
                        {
                            Console.WriteLine($"WARNING: No product inventory found for ProductId {productId} in WarehouseId {productWarehouse.WarehouseId}. Skipping.");
                            continue;
                        }

                        var beforeQtyInt = productInventory.QuantityAvailable;
                        var afterQtyInt = beforeQtyInt - quantity;
                        if (afterQtyInt < 0) afterQtyInt = 0;

                        productInventory.QuantityAvailable = afterQtyInt;
                        productInventory.LastUpdated = DateTime.UtcNow;

                        await _orderRepository.UpdateProductInventoryAsync(productInventory);

                        var productTxn = new ProductInventoryTransaction
                        {
                            InventoryId = productInventory.InventoryId,
                            QuantityChanged = -quantity,
                            PerformedByUserId = null,
                            BeforeQty = beforeQtyInt,
                            AfterQty = afterQtyInt,
                            TransactionType = "Export",
                            TransactionDate = DateTime.Now,
                            Notes = $"Trừ kho sản phẩm cho đơn hàng #{orderId} - Thanh toán ví thành công"
                        };

                        await _orderRepository.AddProductInventoryTransactionAsync(productTxn);
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR deducting inventory for OrderId {orderId}: {ex.Message}");
                throw; // Re-throw để transaction bị rollback
            }
        }

    }
  
}

