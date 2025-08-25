using Microsoft.AspNetCore.Mvc;
using EcoFashionBackEnd.Services;
using EcoFashionBackEnd.Common;
using EcoFashionBackEnd.Common.Payloads.Requests;
using EcoFashionBackEnd.Common.Payloads.Responses;
using EcoFashionBackEnd.Dtos;
using EcoFashionBackEnd.Entities;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace EcoFashionBackEnd.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SubOrderController : ControllerBase
    {
        private readonly SubOrderService _subOrderService;

        public SubOrderController(SubOrderService subOrderService)
        {
            _subOrderService = subOrderService;
        }

        // ===== SELLER ENDPOINTS =====

        /// <summary>
        /// Get all sub-orders for a specific seller (supplier or designer)
        /// </summary>
        [HttpGet("seller/{sellerId}")]
        public async Task<IActionResult> GetSubOrdersBySeller(Guid sellerId)
        {
            try
            {
                var subOrders = await _subOrderService.GetSubOrdersBySellerAsync(sellerId);
                var subOrderModels = subOrders.Select(MapToSubOrderModel).ToList();
                
                return Ok(ApiResult<IEnumerable<SubOrderModel>>.Succeed(subOrderModels));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResult<object>.Fail($"Error retrieving sub-orders: {ex.Message}"));
            }
        }

        /// <summary>
        /// Get detailed information about a specific sub-order
        /// </summary>
        [HttpGet("{subOrderId}")]
        public async Task<IActionResult> GetSubOrderById(int subOrderId)
        {
            try
            {
                var subOrder = await _subOrderService.GetSubOrderByIdAsync(subOrderId);
                if (subOrder == null)
                    return NotFound(ApiResult<object>.Fail("Sub-order not found"));

                var subOrderModel = MapToSubOrderModel(subOrder);
                return Ok(ApiResult<SubOrderModel>.Succeed(subOrderModel));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResult<object>.Fail($"Error retrieving sub-order: {ex.Message}"));
            }
        }

        /// <summary>
        /// Update sub-order status (confirm, ship, deliver, etc.)
        /// </summary>
        [HttpPatch("{subOrderId}/status")]
        public async Task<IActionResult> UpdateSubOrderStatus(int subOrderId, [FromBody] UpdateSubOrderStatusRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // Get current user info for authorization
                if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out int userId))
                    return Unauthorized(ApiResult<object>.Fail("Unable to identify user."));

                var success = await _subOrderService.UpdateSubOrderStatusAsync(subOrderId, request.Status, userId, request.Notes);
                
                if (!success)
                    return BadRequest(ApiResult<object>.Fail("Unable to update sub-order status. Check authorization."));

                return Ok(ApiResult<object>.Succeed("Sub-order status updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResult<object>.Fail($"Error updating sub-order status: {ex.Message}"));
            }
        }

        /// <summary>
        /// Update tracking information for a sub-order
        /// </summary>
        [HttpPatch("{subOrderId}/tracking")]
        public async Task<IActionResult> UpdateTrackingInfo(int subOrderId, [FromBody] UpdateTrackingInfoRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                // Get current user info for authorization
                if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out int userId))
                    return Unauthorized(ApiResult<object>.Fail("Unable to identify user."));

                var success = await _subOrderService.UpdateTrackingInfoAsync(subOrderId, request.TrackingNumber, request.ShippingCarrier, userId);
                
                if (!success)
                    return BadRequest(ApiResult<object>.Fail("Unable to update tracking info. Check authorization."));

                return Ok(ApiResult<object>.Succeed("Tracking information updated successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResult<object>.Fail($"Error updating tracking info: {ex.Message}"));
            }
        }

        /// <summary>
        /// Bulk confirm sub-order (shortcut to set status to Confirmed)
        /// </summary>
        [HttpPost("{subOrderId}/confirm")]
        public async Task<IActionResult> ConfirmSubOrder(int subOrderId, [FromBody] UpdateSubOrderStatusRequest? request = null)
        {
            try
            {
                // Get current user info for authorization
                if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out int userId))
                    return Unauthorized(ApiResult<object>.Fail("Unable to identify user."));

                var success = await _subOrderService.UpdateSubOrderStatusAsync(subOrderId, SubOrderStatus.Confirmed, userId, request?.Notes);
                
                if (!success)
                    return BadRequest(ApiResult<object>.Fail("Unable to confirm sub-order. Check authorization."));

                return Ok(ApiResult<object>.Succeed("Sub-order confirmed successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResult<object>.Fail($"Error confirming sub-order: {ex.Message}"));
            }
        }

        /// <summary>
        /// Mark sub-order as shipped
        /// </summary>
        [HttpPost("{subOrderId}/ship")]
        public async Task<IActionResult> ShipSubOrder(int subOrderId, [FromBody] UpdateTrackingInfoRequest? request = null)
        {
            try
            {
                // Get current user info for authorization
                if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out int userId))
                    return Unauthorized(ApiResult<object>.Fail("Unable to identify user."));

                bool success;
                if (request != null && !string.IsNullOrEmpty(request.TrackingNumber))
                {
                    // Update tracking info and status together
                    success = await _subOrderService.UpdateTrackingInfoAsync(subOrderId, request.TrackingNumber, request.ShippingCarrier, userId);
                }
                else
                {
                    // Just update status to shipped
                    success = await _subOrderService.UpdateSubOrderStatusAsync(subOrderId, SubOrderStatus.Shipped, userId, request?.Notes);
                }
                
                if (!success)
                    return BadRequest(ApiResult<object>.Fail("Unable to ship sub-order. Check authorization."));

                return Ok(ApiResult<object>.Succeed("Sub-order shipped successfully"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResult<object>.Fail($"Error shipping sub-order: {ex.Message}"));
            }
        }

        // ===== CUSTOMER ENDPOINTS =====

        /// <summary>
        /// Get customer overview of all sub-orders for a parent order
        /// </summary>
        [HttpGet("order/{parentOrderId}/customer-overview")]
        public async Task<IActionResult> GetCustomerOrderOverview(int parentOrderId)
        {
            try
            {
                var subOrders = await _subOrderService.GetSubOrdersByParentOrderIdAsync(parentOrderId);
                
                if (!subOrders.Any())
                    return NotFound(ApiResult<object>.Fail("No sub-orders found for this order"));

                var overview = MapToCustomerOrderOverview(subOrders.ToList());
                return Ok(ApiResult<CustomerOrderOverviewModel>.Succeed(overview));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResult<object>.Fail($"Error retrieving order overview: {ex.Message}"));
            }
        }

        /// <summary>
        /// Get seller statistics (for seller dashboard)
        /// </summary>
        [HttpGet("seller/{sellerId}/stats")]
        public async Task<IActionResult> GetSellerStats(Guid sellerId)
        {
            try
            {
                var stats = await _subOrderService.GetSellerSubOrderStatsAsync(sellerId);
                return Ok(ApiResult<Dictionary<string, int>>.Succeed(stats));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResult<object>.Fail($"Error retrieving seller stats: {ex.Message}"));
            }
        }

        // ===== HELPER METHODS =====

        private SubOrderModel MapToSubOrderModel(SubOrder subOrder)
        {
            return new SubOrderModel
            {
                SubOrderId = subOrder.SubOrderId,
                ParentOrderId = subOrder.ParentOrderId,
                SellerId = subOrder.SellerId.ToString(),
                SellerName = subOrder.SellerName,
                SellerType = subOrder.SellerType,
                SellerAvatarUrl = subOrder.SellerAvatarUrl,
                Subtotal = subOrder.Subtotal,
                ShippingFee = subOrder.ShippingFee,
                TotalPrice = subOrder.TotalPrice,
                Status = subOrder.Status.ToString(),
                FulfillmentStatus = subOrder.FulfillmentStatus.ToString(),
                TrackingNumber = subOrder.TrackingNumber,
                ShippingCarrier = subOrder.ShippingCarrier,
                Notes = subOrder.Notes,
                CreatedAt = subOrder.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                ConfirmedAt = subOrder.ConfirmedAt?.ToString("yyyy-MM-dd HH:mm:ss"),
                ShippedAt = subOrder.ShippedAt?.ToString("yyyy-MM-dd HH:mm:ss"),
                DeliveredAt = subOrder.DeliveredAt?.ToString("yyyy-MM-dd HH:mm:ss"),
                EstimatedShippingDate = subOrder.EstimatedShippingDate?.ToString("yyyy-MM-dd"),
                EstimatedDeliveryDate = subOrder.EstimatedDeliveryDate?.ToString("yyyy-MM-dd"),
                UserName = subOrder.ParentOrder?.User?.FullName ?? "Unknown",
                ShippingAddress = subOrder.ParentOrder?.ShippingAddress ?? "Unknown",
                PaymentStatus = subOrder.ParentOrder?.PaymentStatus.ToString() ?? "Unknown",
                Items = subOrder.OrderDetails.Select(MapToSubOrderItemModel).ToList()
            };
        }

        private SubOrderItemModel MapToSubOrderItemModel(OrderDetail orderDetail)
        {
            string itemName = orderDetail.Type switch
            {
                OrderDetailType.material => orderDetail.Material?.Name ?? "Material",
                OrderDetailType.design => orderDetail.Design?.Name ?? "Design",
                OrderDetailType.product => orderDetail.Product?.Design?.Name ?? "Product",
                _ => "Unknown Item"
            };

            string? imageUrl = orderDetail.Type switch
            {
                OrderDetailType.material => orderDetail.Material?.MaterialImages?.FirstOrDefault()?.Image?.ImageUrl,
                OrderDetailType.design => orderDetail.Design?.DesignImages?.FirstOrDefault()?.Image?.ImageUrl,
                OrderDetailType.product => orderDetail.Product?.Design?.DesignImages?.FirstOrDefault()?.Image?.ImageUrl,
                _ => null
            };

            return new SubOrderItemModel
            {
                OrderDetailId = orderDetail.OrderDetailId,
                ItemName = itemName,
                ItemType = orderDetail.Type.ToString(),
                Quantity = orderDetail.Quantity,
                UnitPrice = orderDetail.UnitPrice,
                TotalPrice = orderDetail.UnitPrice * orderDetail.Quantity,
                Status = orderDetail.Status.ToString(),
                ImageUrl = imageUrl
            };
        }

        private CustomerOrderOverviewModel MapToCustomerOrderOverview(List<SubOrder> subOrders)
        {
            var parentOrder = subOrders.FirstOrDefault()?.ParentOrder;
            
            var confirmedCount = subOrders.Count(so => so.Status >= SubOrderStatus.Confirmed);
            var shippedCount = subOrders.Count(so => so.Status >= SubOrderStatus.Shipped);
            var deliveredCount = subOrders.Count(so => so.Status == SubOrderStatus.Delivered);
            var totalCount = subOrders.Count;

            return new CustomerOrderOverviewModel
            {
                OrderId = parentOrder?.OrderId ?? 0,
                UserName = parentOrder?.User?.FullName ?? "Unknown",
                ShippingAddress = parentOrder?.ShippingAddress ?? "Unknown",
                TotalPrice = parentOrder?.TotalPrice ?? subOrders.Sum(so => so.TotalPrice),
                OrderDate = parentOrder?.OrderDate.ToString("yyyy-MM-dd HH:mm:ss") ?? DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                PaymentStatus = parentOrder?.PaymentStatus.ToString() ?? "Unknown",
                TotalSubOrders = totalCount,
                ConfirmedSubOrders = confirmedCount,
                ShippedSubOrders = shippedCount,
                DeliveredSubOrders = deliveredCount,
                ConfirmationProgress = totalCount > 0 ? (double)confirmedCount / totalCount * 100 : 0,
                ShippingProgress = totalCount > 0 ? (double)shippedCount / totalCount * 100 : 0,
                DeliveryProgress = totalCount > 0 ? (double)deliveredCount / totalCount * 100 : 0,
                SubOrders = subOrders.Select(MapToSubOrderProgressModel).ToList(),
                Timeline = GenerateOrderTimeline(subOrders)
            };
        }

        private SubOrderProgressModel MapToSubOrderProgressModel(SubOrder subOrder)
        {
            return new SubOrderProgressModel
            {
                SubOrderId = subOrder.SubOrderId,
                SellerName = subOrder.SellerName,
                SellerType = subOrder.SellerType,
                SellerAvatarUrl = subOrder.SellerAvatarUrl,
                TotalPrice = subOrder.TotalPrice,
                Status = subOrder.Status.ToString(),
                FulfillmentStatus = subOrder.FulfillmentStatus.ToString(),
                TrackingNumber = subOrder.TrackingNumber,
                ShippingCarrier = subOrder.ShippingCarrier,
                TotalItems = subOrder.OrderDetails.Sum(od => od.Quantity),
                ConfirmedAt = subOrder.ConfirmedAt?.ToString("yyyy-MM-dd HH:mm:ss"),
                ShippedAt = subOrder.ShippedAt?.ToString("yyyy-MM-dd HH:mm:ss"),
                DeliveredAt = subOrder.DeliveredAt?.ToString("yyyy-MM-dd HH:mm:ss"),
                EstimatedDeliveryDate = subOrder.EstimatedDeliveryDate?.ToString("yyyy-MM-dd"),
                Items = subOrder.OrderDetails.Select(od => new SubOrderItemProgressModel
                {
                    ItemName = GetItemName(od),
                    ItemType = od.Type.ToString(),
                    Quantity = od.Quantity,
                    Status = od.Status.ToString(),
                    ImageUrl = GetItemImageUrl(od)
                }).ToList()
            };
        }

        private List<OrderTimelineEvent> GenerateOrderTimeline(List<SubOrder> subOrders)
        {
            var timeline = new List<OrderTimelineEvent>();

            // Order created
            var firstSubOrder = subOrders.OrderBy(so => so.CreatedAt).FirstOrDefault();
            if (firstSubOrder != null)
            {
                timeline.Add(new OrderTimelineEvent
                {
                    EventDate = firstSubOrder.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                    EventType = "OrderCreated",
                    Title = "Order Created",
                    Description = $"Order split into {subOrders.Count} sub-orders",
                    Status = "completed"
                });
            }

            // Confirmation events
            foreach (var subOrder in subOrders.Where(so => so.ConfirmedAt.HasValue).OrderBy(so => so.ConfirmedAt))
            {
                timeline.Add(new OrderTimelineEvent
                {
                    EventDate = subOrder.ConfirmedAt!.Value.ToString("yyyy-MM-dd HH:mm:ss"),
                    EventType = "SubOrderConfirmed",
                    Title = "Sub-order Confirmed",
                    Description = $"{subOrder.SellerName} confirmed their items",
                    SellerName = subOrder.SellerName,
                    Status = "completed"
                });
            }

            // Shipping events
            foreach (var subOrder in subOrders.Where(so => so.ShippedAt.HasValue).OrderBy(so => so.ShippedAt))
            {
                timeline.Add(new OrderTimelineEvent
                {
                    EventDate = subOrder.ShippedAt!.Value.ToString("yyyy-MM-dd HH:mm:ss"),
                    EventType = "SubOrderShipped",
                    Title = "Sub-order Shipped",
                    Description = $"{subOrder.SellerName} shipped their items" + 
                                (string.IsNullOrEmpty(subOrder.TrackingNumber) ? "" : $" (Tracking: {subOrder.TrackingNumber})"),
                    SellerName = subOrder.SellerName,
                    Status = "completed"
                });
            }

            // Delivery events
            foreach (var subOrder in subOrders.Where(so => so.DeliveredAt.HasValue).OrderBy(so => so.DeliveredAt))
            {
                timeline.Add(new OrderTimelineEvent
                {
                    EventDate = subOrder.DeliveredAt!.Value.ToString("yyyy-MM-dd HH:mm:ss"),
                    EventType = "SubOrderDelivered",
                    Title = "Sub-order Delivered",
                    Description = $"Items from {subOrder.SellerName} delivered successfully",
                    SellerName = subOrder.SellerName,
                    Status = "completed"
                });
            }

            return timeline.OrderBy(t => DateTime.Parse(t.EventDate)).ToList();
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
    }
}