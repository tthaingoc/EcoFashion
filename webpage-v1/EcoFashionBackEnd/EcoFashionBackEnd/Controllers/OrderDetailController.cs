using AutoMapper;
using EcoFashionBackEnd.Common;
using EcoFashionBackEnd.Common.Payloads.Requests;
using EcoFashionBackEnd.Common.Payloads.Responses;
using EcoFashionBackEnd.Dtos;
using EcoFashionBackEnd.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EcoFashionBackEnd.Controllers;

[Route("api/OrderDetail")]
[ApiController]
public class OrderDetailController : ControllerBase
{
    private readonly OrderDetailService _orderDetailService;
    private readonly IMapper _mapper;
    public OrderDetailController(OrderDetailService service,  IMapper mapper)
    {
        _orderDetailService = service;
        _mapper = mapper;
    }
    [HttpGet("GetAll")]
    public async Task<IActionResult> GetAllOrderDetail()
    {
        var orderDetails = await _orderDetailService.GetAllOrderDetailAsync();
        return Ok(ApiResult<IEnumerable<OrderDetailModel>>.Succeed(orderDetails));
    }
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrderDetailById(int id)
    {
        var order = await _orderDetailService.GetOrderDetailByIdAsync(id);
        if (order == null)
            return NotFound(ApiResult<object>.Fail("Không tìm thấy chi tiết đơn hàng"));
        return Ok(ApiResult<OrderDetailModel>.Succeed(order));
    }
    [HttpPost("Create")]
    public async Task<IActionResult> CreateOrderDetail(CreateOrderDetailRequest request)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out int userId))
            return Unauthorized(ApiResult<CreateDesignResponse>.Fail("Không thể xác định người dùng."));
        var orderDetailId = await _orderDetailService.CreateOrderDetailAsync(userId,request);
        return CreatedAtAction(nameof(GetOrderDetailById), new {id = orderDetailId}, ApiResult<object>.Succeed(new { OrderDetailId = orderDetailId }));
    }
    [HttpPut("Update{orderDetailId}")]
    public async Task<IActionResult> UpdateOrderDetail(int orderDetailId, [FromForm] UpdateOrderDetailRequest request)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out int userId))
            return Unauthorized(ApiResult<CreateDesignResponse>.Fail("Không thể xác định người dùng."));
        try
        {
            var success = await _orderDetailService.UpdateOrderDetailAsync(orderDetailId, request);

            if (!success)
            {
                return NotFound(ApiResult<string>.Fail("Không tìm thấy chi tiết đơn hàng hoặc cập nhật thất bại."));
            }

            return Ok(ApiResult<string>.Succeed("Cập nhật chi tiết đơn hàng thành công."));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResult<string>.Fail($"Lỗi dữ liệu: {ex.Message}"));
        }
        catch (Exception)
        {
            return StatusCode(500, ApiResult<string>.Fail("Đã xảy ra lỗi khi cập nhật chi tiết đơn hàng."));
        }
    }
    [HttpDelete("{orderDetailId}")]
    public async Task<IActionResult> DeleteOrderDetail(int orderDetailId)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out int userId))
            return Unauthorized(ApiResult<CreateDesignResponse>.Fail("Không thể xác định người dùng."));
        var success = await _orderDetailService.DeleteOrderDetailAsync(orderDetailId);
        if (success)
            return Ok(ApiResult<string>.Succeed("Xóa chi tiết đơn hàng thành công"));
        return NotFound(ApiResult<string>.Fail("Không tìm thấy chi tiết đơn hàng"));
    }

    // ===== NEW ENDPOINTS FOR PARTIAL FULFILLMENT SYSTEM =====

    // Get order details with seller-specific filtering
    [HttpGet("by-seller/{sellerId}")]
    public async Task<IActionResult> GetOrderDetailsBySeller(Guid sellerId)
    {
        var orderDetails = await _orderDetailService.GetOrderDetailsBySellerAsync(sellerId);
        return Ok(ApiResult<IEnumerable<OrderDetailModel>>.Succeed(orderDetails));
    }

    // Get order details for a specific order with seller information
    [HttpGet("order/{orderId}/seller-view/{sellerId}")]
    public async Task<IActionResult> GetOrderDetailsForSellerView(int orderId, Guid sellerId)
    {
        var result = await _orderDetailService.GetOrderSellerViewAsync(orderId, sellerId);
        if (result == null)
            return NotFound(ApiResult<object>.Fail("Không tìm thấy đơn hàng hoặc không có quyền truy cập"));

        return Ok(ApiResult<OrderSellerViewModel>.Succeed(result));
    }

    // Update status of specific order detail (for partial fulfillment)
    [HttpPatch("{orderDetailId}/status")]
    public async Task<IActionResult> UpdateOrderDetailStatus(int orderDetailId, [FromBody] UpdateOrderDetailStatusRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Get current user info for authorization
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out int userId))
            return Unauthorized(ApiResult<object>.Fail("Không thể xác định người dùng."));

        var success = await _orderDetailService.UpdateOrderDetailStatusAsync(orderDetailId, request, userId);
        if (!success)
            return BadRequest(ApiResult<object>.Fail("Không thể cập nhật trạng thái. Kiểm tra quyền truy cập."));

        return Ok(ApiResult<object>.Succeed("Cập nhật trạng thái thành công"));
    }

    // Bulk confirm all order details for a seller in an order
    [HttpPost("order/{orderId}/confirm-seller-items/{sellerId}")]
    public async Task<IActionResult> ConfirmAllSellerItems(int orderId, Guid sellerId, [FromBody] BulkConfirmRequest request)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out int userId))
            return Unauthorized(ApiResult<object>.Fail("Không thể xác định người dùng."));

        var success = await _orderDetailService.ConfirmAllSellerItemsAsync(orderId, sellerId, request, userId);
        if (!success)
            return BadRequest(ApiResult<object>.Fail("Không thể xác nhận items. Kiểm tra quyền truy cập."));

        return Ok(ApiResult<object>.Succeed("Đã xác nhận tất cả items của bạn trong đơn hàng"));
    }

    // Get order progress for customer view
    [HttpGet("order/{orderId}/progress")]
    public async Task<IActionResult> GetOrderProgress(int orderId)
    {
        var progress = await _orderDetailService.GetOrderProgressAsync(orderId);
        if (progress == null)
            return NotFound(ApiResult<object>.Fail("Không tìm thấy đơn hàng"));

        return Ok(ApiResult<OrderProgressModel>.Succeed(progress));
    }
}
