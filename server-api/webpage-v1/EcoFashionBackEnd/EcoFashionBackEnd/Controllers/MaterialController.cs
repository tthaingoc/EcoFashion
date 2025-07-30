using Microsoft.AspNetCore.Mvc;
using EcoFashionBackEnd.Services;
using EcoFashionBackEnd.Common.Payloads.Requests;
using EcoFashionBackEnd.Common;
using EcoFashionBackEnd.Common.Payloads.Responses;

namespace EcoFashionBackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MaterialController : ControllerBase
    {
        private readonly MaterialService _materialService;
        private readonly SustainabilityService _sustainabilityService;

        public MaterialController(MaterialService materialService, SustainabilityService sustainabilityService)
        {
            _materialService = materialService;
            _sustainabilityService = sustainabilityService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllMaterials()
        {
            var result = await _materialService.GetAllMaterialsAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMaterialById(int id)
        {
            var result = await _materialService.GetMaterialDetailByIdAsync(id);
            return Ok(result);
        }

        [HttpPost("CreateWithSustainability")]
        public async Task<IActionResult> CreateMaterialFromForm([FromBody] MaterialCreationFormRequest request)
        {
            var result = await _materialService.CreateMaterialFromFormAsync(request);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMaterial(int id)
        {
            var result = await _materialService.DeleteMaterialAsync(id);
            return Ok(result);
        }

        [HttpGet("Sustainability/{materialId}")]
        public async Task<IActionResult> GetMaterialSustainability(int materialId)
        {
            var result = await _sustainabilityService.CalculateMaterialSustainabilityScore(materialId);
            if (result == null)
                return NotFound("Material not found");
            
            return Ok(result);
        }

        [HttpGet("GetProductionCountries")]
        public IActionResult GetProductionCountries()
        {
            var countries = TransportCalculationService.GetCommonProductionCountries();
            return Ok(new { countries });
        }

        [HttpGet("CalculateTransport/{country}")]
        public IActionResult CalculateTransport(string country)
        {
            var (distance, method, description) = TransportCalculationService.GetTransportDetails(country);
            return Ok(new { distance, method, description });
        }

        [HttpGet("GetTransportEvaluation/{distance}/{method}")]
        public IActionResult GetTransportEvaluation(decimal distance, string method)
        {
            var evaluation = TransportCalculationService.GetTransportEvaluation(distance, method);
            return Ok(evaluation);
        }

        [HttpGet("GetProductionEvaluation/{country}")]
        public IActionResult GetProductionEvaluation(string country)
        {
            var evaluation = TransportCalculationService.GetProductionEvaluation(country);
            return Ok(evaluation);
        }

        [HttpGet("GetSustainabilityEvaluation/{score}")]
        public IActionResult GetSustainabilityEvaluation(decimal score)
        {
            var evaluation = _sustainabilityService.GetSustainabilityEvaluation(score);
            return Ok(evaluation);
        }
    }
}
