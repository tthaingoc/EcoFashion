using EcoFashionBackEnd.Common;
using EcoFashionBackEnd.Dtos.Material;
using EcoFashionBackEnd.Entities;
using EcoFashionBackEnd.Repositories;
using Microsoft.EntityFrameworkCore;
using EcoFashionBackEnd.Common.Payloads.Requests;
using EcoFashionBackEnd.Common.Payloads.Responses;
using EcoFashionBackEnd.Dtos;

namespace EcoFashionBackEnd.Services
{
    public class MaterialService
    {
        private readonly AppDbContext _dbContext;
        private readonly SustainabilityService _sustainabilityService;

        public MaterialService(
            AppDbContext dbContext,
            SustainabilityService sustainabilityService)
        {
            _dbContext = dbContext;
            _sustainabilityService = sustainabilityService;
        }

        public async Task<ApiResult<MaterialDetailResponse>> GetMaterialDetailByIdAsync(int materialId)
        {
            try
            {
                var material = await _dbContext.Materials
                    .Include(m => m.MaterialType)
                    .Include(m => m.Supplier)
                    .Include(m => m.MaterialImages).ThenInclude(mi => mi.Image)
                    .Include(m => m.MaterialSustainabilityMetrics)
                    .ThenInclude(ms => ms.SustainabilityCriterion)
                    .FirstOrDefaultAsync(m => m.MaterialId == materialId);

                if (material == null)
                    return ApiResult<MaterialDetailResponse>.Fail("Material not found");

                var sustainabilityReport = await _sustainabilityService.CalculateMaterialSustainabilityScore(materialId);

                // Get all benchmarks for this material's type
                var allBenchmarks = await _dbContext.MaterialTypesBenchmarks
                    .Include(b => b.MaterialType)
                    .Include(b => b.SustainabilityCriteria)
                    .ToListAsync();

                var materialBenchmarks = new List<MaterialTypeBenchmarkModel>();
                
                try
                {
                    materialBenchmarks = allBenchmarks
                        .Where(b => b.TypeId == material.TypeId)
                        .Select(b => CalculateBenchmarkComparison(b, material, b.CriteriaId))
                        .ToList();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error calculating benchmark comparison: {ex.Message}");
                    Console.WriteLine($"Stack trace: {ex.StackTrace}");
                    // Fallback to basic benchmarks without comparison
                    materialBenchmarks = allBenchmarks
                        .Where(b => b.TypeId == material.TypeId)
                        .Select(b => new MaterialTypeBenchmarkModel
                        {
                            BenchmarkId = b.BenchmarkId,
                            TypeId = b.TypeId,
                            CriteriaId = b.CriteriaId,
                            Value = (float)b.Value,
                            MaterialType = b.MaterialType,
                            SustainabilityCriteria = b.SustainabilityCriteria
                        })
                        .ToList();
                }

                var response = new MaterialDetailResponse
                {
                    MaterialId = material.MaterialId,
                    Name = material.Name ?? string.Empty,
                    Description = material.Description ?? string.Empty,
                    MaterialTypeName = material.MaterialType?.TypeName ?? string.Empty,
                    RecycledPercentage = material.RecycledPercentage,
                    QuantityAvailable = material.QuantityAvailable,
                    PricePerUnit = material.PricePerUnit,
                    DocumentationUrl = material.DocumentationUrl,
                    CreatedAt = material.CreatedAt,
                    CarbonFootprint = material.CarbonFootprint,
                    CarbonFootprintUnit = material.CarbonFootprintUnit,
                    WaterUsage = material.WaterUsage,
                    WaterUsageUnit = material.WaterUsageUnit,
                    WasteDiverted = material.WasteDiverted,
                    WasteDivertedUnit = material.WasteDivertedUnit,
                    ProductionCountry = material.ProductionCountry,
                    ProductionRegion = material.ProductionRegion,
                    ManufacturingProcess = material.ManufacturingProcess,
                    CertificationDetails = material.CertificationDetails,
                    CertificationExpiryDate = material.CertificationExpiryDate,
                    TransportDistance = material.TransportDistance,
                    TransportMethod = material.TransportMethod,
                    ApprovalStatus = material.ApprovalStatus,
                    AdminNote = material.AdminNote,
                    IsAvailable = material.IsAvailable,
                    LastUpdated = material.LastUpdated,
                    SustainabilityScore = sustainabilityReport?.OverallSustainabilityScore,
                    SustainabilityLevel = sustainabilityReport?.SustainabilityLevel,
                    SustainabilityColor = sustainabilityReport?.LevelColor,
                    Supplier = material.Supplier == null ? null : new SupplierPublicModel
                    {
                        SupplierId = material.Supplier.SupplierId,
                        SupplierName = material.Supplier.SupplierName,
                        AvatarUrl = material.Supplier.AvatarUrl,
                        Bio = material.Supplier.Bio,
                        SpecializationUrl = material.Supplier.SpecializationUrl,
                        PortfolioUrl = material.Supplier.PortfolioUrl,
                        PortfolioFiles = material.Supplier.PortfolioFiles,
                        BannerUrl = material.Supplier.BannerUrl,
                        Email = material.Supplier.Email,
                        PhoneNumber = material.Supplier.PhoneNumber,
                        Address = material.Supplier.Address,
                        Rating = material.Supplier.Rating,
                        ReviewCount = material.Supplier.ReviewCount,
                        Certificates = material.Supplier.Certificates,
                        CreatedAt = material.Supplier.CreatedAt
                    },
                    ImageUrls = material.MaterialImages?.Select(img => img.Image?.ImageUrl).Where(url => !string.IsNullOrEmpty(url)).Select(url => url!).ToList() ?? new List<string>(),
                    SustainabilityCriteria = material.MaterialSustainabilityMetrics?.Select(ms => new MaterialSustainabilityCriterionDto
                    {
                        CriterionId = ms.CriterionId,
                        Name = ms.SustainabilityCriterion?.Name,
                        Description = ms.SustainabilityCriterion?.Description,
                        Unit = ms.SustainabilityCriterion?.Unit,
                        Value = ms.Value
                    }).ToList() ?? new List<MaterialSustainabilityCriterionDto>(),
                    Benchmarks = materialBenchmarks
                };

                return ApiResult<MaterialDetailResponse>.Succeed(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetMaterialDetailByIdAsync: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return ApiResult<MaterialDetailResponse>.Fail(ex.Message);
            }
        }

        public async Task<ApiResult<List<MaterialDetailDto>>> GetAllMaterialsAsync()
        {
            try
            {
                var materials = await _dbContext.Materials
                    .Include(m => m.MaterialType)
                    .Include(m => m.Supplier)
                    .Include(m => m.MaterialImages).ThenInclude(mi => mi.Image)
                    .Include(m => m.MaterialSustainabilityMetrics)
                    .ThenInclude(ms => ms.SustainabilityCriterion)
                    .ToListAsync();

                // Batch calculate sustainability scores for all materials
                var materialIds = materials.Select(m => m.MaterialId).ToList();
                var sustainabilityReports = await _sustainabilityService.CalculateMaterialsSustainabilityScores(materialIds);

                // Get all benchmarks for all material types
                var allBenchmarks = await _dbContext.MaterialTypesBenchmarks
                    .Include(b => b.MaterialType)
                    .Include(b => b.SustainabilityCriteria)
                    .ToListAsync();

                var materialDtos = new List<MaterialDetailDto>();

                foreach (var material in materials)
                {
                    sustainabilityReports.TryGetValue(material.MaterialId, out var sustainabilityReport);

                    // Get benchmarks for this material's type
                    var materialBenchmarks = allBenchmarks
                        .Where(b => b.TypeId == material.TypeId)
                        .Select(b => new MaterialTypeBenchmarkModel
                        {
                            BenchmarkId = b.BenchmarkId,
                            TypeId = b.TypeId,
                            CriteriaId = b.CriteriaId,
                            Value = (float)b.Value,
                            MaterialType = b.MaterialType,
                            SustainabilityCriteria = b.SustainabilityCriteria
                        })
                        .ToList();

                    var dto = new MaterialDetailDto
                    {
                        MaterialId = material.MaterialId,
                        Name = material.Name ?? string.Empty,
                        Description = material.Description ?? string.Empty,
                        MaterialTypeName = material.MaterialType?.TypeName ?? string.Empty,
                        RecycledPercentage = material.RecycledPercentage,
                        QuantityAvailable = material.QuantityAvailable,
                        PricePerUnit = material.PricePerUnit,
                        CreatedAt = material.CreatedAt,
                        CarbonFootprint = material.CarbonFootprint,
                        CarbonFootprintUnit = material.CarbonFootprintUnit,
                        WaterUsage = material.WaterUsage,
                        WaterUsageUnit = material.WaterUsageUnit,
                        WasteDiverted = material.WasteDiverted,
                        WasteDivertedUnit = material.WasteDivertedUnit,
                        ProductionCountry = material.ProductionCountry,
                        ProductionRegion = material.ProductionRegion,
                        ManufacturingProcess = material.ManufacturingProcess,
                        CertificationDetails = material.CertificationDetails,
                        CertificationExpiryDate = material.CertificationExpiryDate,
                        TransportDistance = material.TransportDistance,
                        TransportMethod = material.TransportMethod,
                        ApprovalStatus = material.ApprovalStatus,
                        AdminNote = material.AdminNote,
                        IsAvailable = material.IsAvailable,
                        LastUpdated = material.LastUpdated,
                        SupplierName = material.Supplier?.SupplierName ?? string.Empty,
                        SupplierId = material.SupplierId,
                        ImageUrls = material.MaterialImages?.Select(img => img.Image?.ImageUrl).Where(url => !string.IsNullOrEmpty(url)).Select(url => url!).ToList() ?? new List<string>(),
                        // Supplier object
                        Supplier = material.Supplier != null ? new SupplierPublicModel
                        {
                            SupplierId = material.Supplier.SupplierId,
                            SupplierName = material.Supplier.SupplierName,
                            AvatarUrl = material.Supplier.AvatarUrl,
                            Bio = material.Supplier.Bio,
                            SpecializationUrl = material.Supplier.SpecializationUrl,
                            PortfolioUrl = material.Supplier.PortfolioUrl,
                            PortfolioFiles = material.Supplier.PortfolioFiles,
                            BannerUrl = material.Supplier.BannerUrl,
                            Email = material.Supplier.Email,
                            PhoneNumber = material.Supplier.PhoneNumber,
                            Address = material.Supplier.Address,
                            Rating = material.Supplier.Rating,
                            ReviewCount = material.Supplier.ReviewCount,
                            Certificates = material.Supplier.Certificates,
                            CreatedAt = material.Supplier.CreatedAt
                        } : null,
                        // Sustainability information
                        SustainabilityScore = sustainabilityReport?.OverallSustainabilityScore,
                        SustainabilityLevel = sustainabilityReport?.SustainabilityLevel,
                        SustainabilityColor = sustainabilityReport?.LevelColor,
                        // Sustainability criteria
                        SustainabilityCriteria = material.MaterialSustainabilityMetrics?.Select(ms => new MaterialSustainabilityCriterionDto
                        {
                            CriterionId = ms.CriterionId,
                            Name = ms.SustainabilityCriterion?.Name,
                            Description = ms.SustainabilityCriterion?.Description,
                            Unit = ms.SustainabilityCriterion?.Unit,
                            Value = ms.Value
                        }).ToList() ?? new List<MaterialSustainabilityCriterionDto>(),
                        // Benchmarks for this material type
                        Benchmarks = materialBenchmarks
                    };

                    materialDtos.Add(dto);
                }

                return ApiResult<List<MaterialDetailDto>>.Succeed(materialDtos);
            }
            catch (Exception ex)
            {
                return ApiResult<List<MaterialDetailDto>>.Fail(ex.Message);
            }
        }

        public async Task<ApiResult<MaterialCreationResponse>> CreateMaterialFromFormAsync(MaterialCreationFormRequest request)
        {
            try
            {
                // Tự động tính toán thông tin vận chuyển nếu chưa có
                TransportCalculationService.CalculateTransportInfo(request);

                var material = new Material
                {
                    SupplierId = request.SupplierId,
                    TypeId = request.TypeId,
                    Name = request.Name,
                    Description = request.Description,
                    RecycledPercentage = request.RecycledPercentage,
                    QuantityAvailable = request.QuantityAvailable,
                    PricePerUnit = request.PricePerUnit,
                    DocumentationUrl = request.DocumentationUrl,
                    CarbonFootprint = request.CarbonFootprint,
                    WaterUsage = request.WaterUsage,
                    WasteDiverted = request.WasteDiverted,
                    ProductionCountry = request.ProductionCountry,
                    ProductionRegion = request.ProductionRegion,
                    ManufacturingProcess = request.ManufacturingProcess,
                    CertificationDetails = request.CertificationDetails,
                    TransportDistance = request.TransportDistance,
                    TransportMethod = request.TransportMethod,
                    IsAvailable = request.IsAvailable,
                    CreatedAt = DateTime.UtcNow,
                    LastUpdated = DateTime.UtcNow
                };

                _dbContext.Materials.Add(material);
                await _dbContext.SaveChangesAsync();

                if (request.CarbonFootprint.HasValue)
                {
                    _dbContext.MaterialSustainabilities.Add(new MaterialSustainability
                    {
                        MaterialId = material.MaterialId,
                        CriterionId = 1,
                        Value = request.CarbonFootprint.Value
                    });
                }
                if (request.WaterUsage.HasValue)
                {
                    _dbContext.MaterialSustainabilities.Add(new MaterialSustainability
                    {
                        MaterialId = material.MaterialId,
                        CriterionId = 2,
                        Value = request.WaterUsage.Value
                    });
                }
                if (request.WasteDiverted.HasValue)
                {
                    _dbContext.MaterialSustainabilities.Add(new MaterialSustainability
                    {
                        MaterialId = material.MaterialId,
                        CriterionId = 3,
                        Value = request.WasteDiverted.Value
                    });
                }
                _dbContext.MaterialSustainabilities.Add(new MaterialSustainability
                {
                    MaterialId = material.MaterialId,
                    CriterionId = 5,
                    Value = request.RecycledPercentage
                });
                await _dbContext.SaveChangesAsync();

                var sustainabilityReport = await _sustainabilityService.CalculateMaterialSustainabilityScore(material.MaterialId);

                var response = new MaterialCreationResponse
                {
                    MaterialId = material.MaterialId,
                    Name = material.Name ?? string.Empty,
                    Description = material.Description ?? string.Empty,
                    MaterialTypeName = await GetMaterialTypeName(material.TypeId),
                    RecycledPercentage = material.RecycledPercentage,
                    QuantityAvailable = material.QuantityAvailable,
                    PricePerUnit = material.PricePerUnit,
                    DocumentationUrl = material.DocumentationUrl,
                    CreatedAt = material.CreatedAt,
                    LastUpdated = material.LastUpdated,
                    CarbonFootprint = material.CarbonFootprint ?? 0,
                    WaterUsage = material.WaterUsage ?? 0,
                    WasteDiverted = material.WasteDiverted ?? 0,
                    ProductionCountry = material.ProductionCountry,
                    ManufacturingProcess = material.ManufacturingProcess,
                    CertificationDetails = material.CertificationDetails,
                    // IsAvailable = material.IsAvailable, // Not in MaterialCreationResponse
                    SustainabilityScore = (int)(sustainabilityReport?.OverallSustainabilityScore ?? 0),
                    SustainabilityLevel = sustainabilityReport?.SustainabilityLevel ?? "Unknown",
                    SustainabilityColor = sustainabilityReport?.LevelColor ?? "gray",
                    MarketPosition = GetMarketPosition((int?)(sustainabilityReport?.OverallSustainabilityScore ?? 0)),
                    CompetitiveAdvantage = GetCompetitiveAdvantage(material),
                    CriterionScores = sustainabilityReport?.CriterionDetails?.Select(cd => new MaterialCreationResponse.CriterionScoreDetail
                    {
                        CriterionName = cd.CriterionName,
                        ActualValue = cd.ActualValue,
                        BenchmarkValue = cd.BenchmarkValue,
                        Unit = cd.Unit,
                        Score = cd.Score,
                        Status = cd.Status
                    }).ToList() ?? new List<MaterialCreationResponse.CriterionScoreDetail>(),
                    Summary = new MaterialCreationResponse.SustainabilitySummary
                    {
                        TotalCriteria = sustainabilityReport?.Summary.TotalCriteria ?? 0,
                        ExcellentCriteria = sustainabilityReport?.Summary.ExcellentCriteria ?? 0,
                        GoodCriteria = sustainabilityReport?.Summary.GoodCriteria ?? 0,
                        AverageCriteria = sustainabilityReport?.Summary.AverageCriteria ?? 0,
                        NeedsImprovementCriteria = sustainabilityReport?.Summary.NeedsImprovementCriteria ?? 0,
                        Recommendation = sustainabilityReport?.Summary.Recommendation ?? string.Empty
                    }
                };

                return ApiResult<MaterialCreationResponse>.Succeed(response);
            }
            catch (Exception ex)
            {
                return ApiResult<MaterialCreationResponse>.Fail(ex.Message);
            }
        }

        public async Task<ApiResult<List<MaterialTypeModel>>> GetAllMaterialTypesAsync()
        {
            try
            {
                var materialTypes = await _dbContext.MaterialTypes
                    .Where(mt => mt.IsActive)
                    .OrderBy(mt => mt.DisplayOrder)
                    .Select(mt => new MaterialTypeModel
                    {
                        TypeId = mt.TypeId,
                        TypeName = mt.TypeName ?? string.Empty,
                        Description = mt.Description,
                        Category = mt.Category,
                        IsOrganic = mt.IsOrganic,
                        IsRecycled = mt.IsRecycled,
                        SustainabilityNotes = mt.SustainabilityNotes,
                        DisplayOrder = mt.DisplayOrder,
                        IsActive = mt.IsActive
                    })
                    .ToListAsync();

                return ApiResult<List<MaterialTypeModel>>.Succeed(materialTypes);
            }
            catch (Exception ex)
            {
                return ApiResult<List<MaterialTypeModel>>.Fail(ex.Message);
            }
        }

        public async Task<ApiResult<bool>> DeleteMaterialAsync(int materialId)
        {
            try
            {
                var material = await _dbContext.Materials.FindAsync(materialId);
                if (material == null)
                    return ApiResult<bool>.Fail("Material not found");

                _dbContext.Materials.Remove(material);
                await _dbContext.SaveChangesAsync();

                return ApiResult<bool>.Succeed(true);
            }
            catch (Exception ex)
            {
                return ApiResult<bool>.Fail(ex.Message);
            }
        }

        private async Task<string> GetMaterialTypeName(int typeId)
        {
            var materialType = await _dbContext.MaterialTypes.FindAsync(typeId);
            return materialType?.TypeName ?? "Unknown";
        }

        private string GetMarketPosition(int? sustainabilityScore)
        {
            if (!sustainabilityScore.HasValue) return "Unknown";
            return sustainabilityScore.Value switch
            {
                >= 80 => "Premium - Phù hợp cho thị trường cao cấp",
                >= 60 => "Standard - Phù hợp cho thị trường phổ thông",
                >= 40 => "Budget - Phù hợp cho thị trường giá rẻ",
                _ => "Limited - Chỉ phù hợp cho thị trường đặc biệt"
            };
        }

        private string GetCompetitiveAdvantage(Material material)
        {
            var advantages = new List<string>();

            if (material.RecycledPercentage > 50)
                advantages.Add("Tỷ lệ tái chế cao");
            if (material.CarbonFootprint < 3)
                advantages.Add("Lượng carbon thấp");
            if (material.WaterUsage < 100)
                advantages.Add("Tiết kiệm nước");
            if (!string.IsNullOrEmpty(material.CertificationDetails))
                advantages.Add("Có chứng nhận bền vững");

            return string.Join(", ", advantages);
        }

        // Helper method để tính toán so sánh benchmark
        private MaterialTypeBenchmarkModel CalculateBenchmarkComparison(
            MaterialTypeBenchmark benchmark, 
            Material material, 
            int criterionId)
        {
            var result = new MaterialTypeBenchmarkModel
            {
                BenchmarkId = benchmark.BenchmarkId,
                TypeId = benchmark.TypeId,
                CriteriaId = benchmark.CriteriaId,
                Value = (float)benchmark.Value,
                MaterialType = benchmark.MaterialType,
                SustainabilityCriteria = benchmark.SustainabilityCriteria
            };

            // Lấy giá trị thực tế từ material
            float? actualValue = criterionId switch
            {
                1 => material.CarbonFootprint.HasValue ? (float)material.CarbonFootprint : null, // Carbon Footprint
                2 => material.WaterUsage.HasValue ? (float)material.WaterUsage : null, // Water Usage
                3 => material.WasteDiverted.HasValue ? (float)material.WasteDiverted : null, // Waste Diverted
                4 => !string.IsNullOrEmpty(material.CertificationDetails) && 
                     (material.CertificationDetails.Contains("GOTS") || 
                      material.CertificationDetails.Contains("Organic")) ? 1f : 0f, // Organic Certification
                5 => (float)material.RecycledPercentage, // Recycled Content
                _ => null
            };

            result.ActualValue = actualValue;

            if (actualValue.HasValue)
            {
                // Tính phần trăm cải thiện
                float benchmarkValue = (float)benchmark.Value;
                float improvement = 0f;

                // Logic tính toán tùy theo loại tiêu chí
                switch (criterionId)
                {
                    case 1: // Carbon Footprint - thấp hơn = tốt hơn
                        if (benchmarkValue > 0)
                            improvement = ((benchmarkValue - actualValue.Value) / benchmarkValue) * 100;
                        break;
                    case 2: // Water Usage - thấp hơn = tốt hơn
                        if (benchmarkValue > 0)
                            improvement = ((benchmarkValue - actualValue.Value) / benchmarkValue) * 100;
                        break;
                    case 3: // Waste Diverted - cao hơn = tốt hơn
                        if (benchmarkValue > 0)
                            improvement = ((actualValue.Value - benchmarkValue) / benchmarkValue) * 100;
                        break;
                    case 4: // Organic Certification - boolean logic
                        if (actualValue.Value >= 1f && benchmarkValue >= 1f)
                        {
                            improvement = 0f; // Cả hai đều có certification
                            result.ImprovementStatus = "Đạt chuẩn";
                            result.ImprovementColor = "success";
                        }
                        else if (actualValue.Value >= 1f && benchmarkValue < 1f)
                        {
                            improvement = 100f; // Có certification khi benchmark không yêu cầu
                            result.ImprovementStatus = "Vượt chuẩn";
                            result.ImprovementColor = "success";
                        }
                        else if (actualValue.Value < 1f && benchmarkValue >= 1f)
                        {
                            improvement = -100f; // Không có certification khi benchmark yêu cầu
                            result.ImprovementStatus = "Chưa đạt";
                            result.ImprovementColor = "error";
                        }
                        else
                        {
                            improvement = 0f; // Cả hai đều không có certification
                            result.ImprovementStatus = "Không yêu cầu";
                            result.ImprovementColor = "warning";
                        }
                        result.ImprovementPercentage = improvement;
                        return result; // Return sớm cho Organic Certification
                    case 5: // Recycled Content - cao hơn = tốt hơn
                        if (benchmarkValue > 0)
                            improvement = ((actualValue.Value - benchmarkValue) / benchmarkValue) * 100;
                        break;
                }

                result.ImprovementPercentage = improvement;

                // Xác định trạng thái và màu sắc (chỉ cho các tiêu chí khác Organic Certification)
                if (criterionId != 4) // Không áp dụng cho Organic Certification
                {
                    if (improvement > 0)
                    {
                        result.ImprovementStatus = "Tốt hơn";
                        result.ImprovementColor = "success";
                    }
                    else if (improvement < 0)
                    {
                        result.ImprovementStatus = "Kém hơn";
                        result.ImprovementColor = "error";
                    }
                    else
                    {
                        result.ImprovementStatus = "Bằng";
                        result.ImprovementColor = "warning";
                    }
                }
            }

            return result;
        }
    }
}
