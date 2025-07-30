using AutoMapper;
using Azure;
using EcoFashionBackEnd.Common;
using EcoFashionBackEnd.Common.Payloads.Requests;
using EcoFashionBackEnd.Common.Payloads.Responses;
using EcoFashionBackEnd.Dtos;
using EcoFashionBackEnd.Dtos.Design;
using EcoFashionBackEnd.Services;
using Humanizer;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
namespace EcoFashionBackEnd.Controllers;



//[Authorize]
[Route("api/Design")]
[ApiController]
public class DesignController : ControllerBase
{
    private readonly DesignService _designService;
    private readonly DesignerService _designerService;
    private readonly IMapper _mapper;

    public DesignController(DesignService designService, DesignerService designerService,IMapper mapper)
    {
        _designService = designService;
        _designerService = designerService;
        _mapper = mapper;
    }

    [HttpGet("GetAll")]
    public async Task<IActionResult> GetAllDesigns()
    {
        var designs = await _designService.GetAllDesigns();
        //return Ok(ApiResult<IEnumerable<DesignModel>>.Succeed(designs));
        var response = _mapper.Map<IEnumerable<DesignDetailResponse>>(designs);
        return Ok(ApiResult<IEnumerable<DesignDetailResponse>>.Succeed(response));
    }

    [HttpGet("GetAllPagination")]
    public async Task<IActionResult> GetAllDesignPagination([FromQuery] int page = 1, [FromQuery] int pageSize = 12)
    {
        var designs = await _designService.GetAllDesignsPagination(page, pageSize);
        var response = _mapper.Map<IEnumerable<DesignDetailResponse>>(designs);
        return Ok(ApiResult<IEnumerable<DesignDetailResponse>>.Succeed(response));
    }


    [HttpGet("{id}")]
    public async Task<IActionResult> GetDesignById(int id)
    {
        var design = await _designService.GetDesignById(id);
        if (design == null) return NotFound(ApiResult<DesignModel>.Fail("Không tìm thấy thiết kế."));
        return Ok(ApiResult<DesignModel>.Succeed(design));
    }

    [HttpGet("Detail/{id}")]
    public async Task<IActionResult> GetDesignDetail(int id)
    {
        var dto = await _designService.GetDesignDetailById(id);
        if (dto == null)
            return NotFound(ApiResult<DesignDetailResponse>.Fail("Không tìm thấy thiết kế."));

        var response = _mapper.Map<DesignDetailResponse>(dto);
        return Ok(ApiResult<DesignDetailResponse>.Succeed(response));
    }



    [HttpPost("Create")]
    public async Task<IActionResult> CreateDesign([FromForm] CreateDesignRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized(ApiResult<CreateDesignResponse>.Fail("Không thể xác định người dùng."));
        }

        var designerId = await _designerService.GetDesignerIdByUserId(userId);
        if (!designerId.HasValue)
        {
            return BadRequest(ApiResult<CreateDesignResponse>.Fail("Người dùng này không phải là nhà thiết kế."));
        }

        var designId = await _designService.CreateDesign(request, designerId.Value, request.ImageFiles);
        var response = new CreateDesignResponse { DesignId = designId };
        return CreatedAtAction(nameof(GetDesignById), new { id = response.DesignId }, ApiResult<CreateDesignResponse>.Succeed(response));
    }

    [HttpPut("update-dessignVariant-By{id}")]
    public async Task<IActionResult> UpdateDesign(int id, [FromBody] UpdateDesignRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized(ApiResult<object>.Fail("Không thể xác định người dùng."));
        }

        var designerId = await _designerService.GetDesignerIdByUserId(userId);
        if (!designerId.HasValue)
        {
            return BadRequest(ApiResult<object>.Fail("Người dùng này không phải là nhà thiết kế."));
        }

        var existingDesign = await _designService.GetDesignById(id);
        if (existingDesign == null || existingDesign.DesignerId != designerId.Value)
        {
            return NotFound(ApiResult<object>.Fail("Không tìm thấy thiết kế hoặc bạn không có quyền cập nhật."));
        }

        var success = await _designService.UpdateDesignVariants(id, request);
        if (success)
            return Ok(ApiResult<object>.Succeed("Thiết kế đã được cập nhật."));

        return BadRequest(ApiResult<object>.Fail("Cập nhật thiết kế thất bại."));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDesign(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized(ApiResult<object>.Fail("Không thể xác định người dùng."));
        }

        var designerId = await _designerService.GetDesignerIdByUserId(userId);
        if (!designerId.HasValue)
        {
            return BadRequest(ApiResult<object>.Fail("Người dùng này không phải là nhà thiết kế."));
        }

        var existingDesign = await _designService.GetDesignById(id);
        if (existingDesign == null || existingDesign.DesignerId != designerId.Value)
        {
            return NotFound(ApiResult<object>.Fail("Không tìm thấy thiết kế hoặc bạn không có quyền xóa."));
        }

        var deleted = await _designService.DeleteDesign(id);
        if (deleted)
            return Ok(ApiResult<object>.Succeed("Thiết kế đã được xóa."));
        return BadRequest(ApiResult<object>.Fail("Xóa thiết kế thất bại."));
    }

    [HttpPost("variants")]
    public async Task<IActionResult> AddVariant([FromBody] CreateDesignVariantRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            return Unauthorized(ApiResult<object>.Fail("Không xác định được người dùng."));

        try
        {
            var result = await _designService.AddVariantAndUpdateMaterialsAsync(request, userId);
            if (result)
                return Ok(ApiResult<object>.Succeed("Thêm biến thể thành công."));
            return BadRequest(ApiResult<object>.Fail("Thêm biến thể thất bại."));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResult<object>.Fail($"Lỗi: {ex.Message}"));
        }
    }




}