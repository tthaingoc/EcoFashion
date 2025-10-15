using EcoFashionBackEnd.Entities;
using EcoFashionBackEnd.Common.Payloads.Requests;
using EcoFashionBackEnd.Repositories;

namespace EcoFashionBackEnd.Services
{
    /// <summary>
    /// Service for handling complex Material business logic
    /// Centralizes inventory management, validation, and workflow operations
    /// </summary>
    public class MaterialBusinessService
    {
        private readonly IMaterialRepository _materialRepository;
        private readonly NotificationService _notificationService;

        public MaterialBusinessService(
            IMaterialRepository materialRepository,
            NotificationService notificationService)
        {
            _materialRepository = materialRepository;
            _notificationService = notificationService;
        }

        // Validate material creation request with business rules
        public async Task<(bool IsValid, string ErrorMessage)> ValidateMaterialCreationAsync(MaterialCreationFormRequest request)
        {
            // Guard: validate supplier and material type to avoid FK errors
            var supplierExists = await _materialRepository.SupplierExistsAsync(request.SupplierId);
            if (!supplierExists)
            {
                return (false, "Supplier not found or not loaded. Vui lòng đăng nhập lại hoặc thử lại sau.");
            }

            var materialTypeExists = await _materialRepository.MaterialTypeExistsAsync(request.TypeId);
            if (!materialTypeExists)
            {
                return (false, "Material type không hợp lệ.");
            }

            // Note:
            // // Kiểm tra trùng tên Material theo từng supplier (không phân biệt hoa thường, bỏ khoảng trắng đầu/cuối)
            // var normalizedName = request.Name?.Trim();
            // if (!string.IsNullOrWhiteSpace(normalizedName))
            // {
            //     var normalizedLowerName = normalizedName.ToLower();
            //     var isDuplicateName = await _materialRepository.FindByCondition(
            //         m => m.SupplierId == request.SupplierId
            //              && m.Name != null
            //              && m.Name.Trim().ToLower() == normalizedLowerName)
            //         .AnyAsync();

            //     if (isDuplicateName)
            //     {
            //         return (false, "Bạn đã có Material cùng tên. Vui lòng chọn tên khác.");
            //     }
            // }

            return (true, string.Empty);
        }

        // Create new material with business logic and sustainability metrics
        public async Task<Material> CreateMaterialAsync(MaterialCreationFormRequest request)
        {
            // Tự động tính toán thông tin vận chuyển nếu chưa có (handles both auto and override)
            TransportCalculationService.CalculateTransportInfo(request);

            // Normalize optional URL: treat empty/whitespace as null
            var normalizedDocUrl = string.IsNullOrWhiteSpace(request.DocumentationUrl)
                ? null
                : request.DocumentationUrl.Trim();

            var material = new Material
            {
                SupplierId = request.SupplierId,
                TypeId = request.TypeId,
                Name = request.Name,
                Description = request.Description,
                RecycledPercentage = request.RecycledPercentage,
                QuantityAvailable = request.QuantityAvailable,
                PricePerUnit = request.PricePerUnit,
                DocumentationUrl = normalizedDocUrl,
                // 1.2.3. sustainability 
                CarbonFootprint = request.CarbonFootprint,
                CarbonFootprintUnit = "kg CO2e/mét",
                WaterUsage = request.WaterUsage,
                WaterUsageUnit = "lít/mét",
                WasteDiverted = request.WasteDiverted,
                WasteDivertedUnit = "%",
                //4. Transport
                ProductionCountry = request.ProductionCountry,
                ProductionRegion = request.ProductionRegion,
                ManufacturingProcess = request.ManufacturingProcess,
                //5. Certification
                CertificationDetails = request.CertificationDetails,
                CertificationExpiryDate = DateTime.UtcNow.AddDays(30),
                // Use calculated transport info from CalculateTransportInfo (supports override)
                TransportDistance = request.TransportDistance,
                TransportMethod = request.TransportMethod,
                // Newly created materials require admin approval
                ApprovalStatus = "Pending",
                IsAvailable = false,
                CreatedAt = DateTime.UtcNow,
                LastUpdated = DateTime.UtcNow
            };

            await _materialRepository.AddAsync(material);
            await _materialRepository.Commit();

            // Add sustainability metrics
            await AddSustainabilityMetricsAsync(material, request);

            // Send notification to admin about new material
            await _notificationService.CreateNewMaterialNotificationAsync(material.MaterialId);

            return material;
        }

        // Add sustainability metrics for a material
        private async Task AddSustainabilityMetricsAsync(Material material, MaterialCreationFormRequest request)
        {
            var sustainabilityEntries = new List<MaterialSustainability>();

            // Add core sustainability metrics (Carbon, Water, Waste) - use fixed CriterionIds
            if (request.CarbonFootprint.HasValue)
            {
                sustainabilityEntries.Add(new MaterialSustainability
                {
                    MaterialId = material.MaterialId,
                    CriterionId = 1, // Carbon Footprint
                    Value = request.CarbonFootprint.Value
                });
            }
            if (request.WaterUsage.HasValue)
            {
                sustainabilityEntries.Add(new MaterialSustainability
                {
                    MaterialId = material.MaterialId,
                    CriterionId = 2, // Water Usage
                    Value = request.WaterUsage.Value
                });
            }
            if (request.WasteDiverted.HasValue)
            {
                sustainabilityEntries.Add(new MaterialSustainability
                {
                    MaterialId = material.MaterialId,
                    CriterionId = 3, // Waste Diverted
                    Value = request.WasteDiverted.Value
                });
            }

            // Add sustainability certifications from frontend selection
            // Frontend sends certificates as { criterionId: X, value: 100 } where value=100 means "has certificate"
            if (request.SustainabilityCriteria != null && request.SustainabilityCriteria.Any())
            {
                // Get valid criterion IDs that exist in database and are active
                var validCriterionIds = await _materialRepository.GetActiveSustainabilityCriteriaIdsAsync();

                foreach (var criterion in request.SustainabilityCriteria)
                {
                    // Skip if criterion doesn't exist or is already added by core metrics
                    if (!validCriterionIds.Contains(criterion.CriterionId) ||
                        sustainabilityEntries.Any(se => se.CriterionId == criterion.CriterionId))
                    {
                        continue;
                    }

                    sustainabilityEntries.Add(new MaterialSustainability
                    {
                        MaterialId = material.MaterialId,
                        CriterionId = criterion.CriterionId,
                        Value = criterion.Value
                    });
                }
            }

            // Add all entries in one go to avoid duplicate key conflicts
            if (sustainabilityEntries.Any())
            {
                await _materialRepository.AddMaterialSustainabilityMetricsAsync(sustainabilityEntries);
                await _materialRepository.Commit();
            }

            // Transport (CriterionId = 5) is calculated dynamically in SustainabilityService
            // No need to store transport data in MaterialSustainability table
        }

        // Handle material approval/rejection workflow
        public async Task<bool> SetMaterialApprovalAsync(int materialId, bool approve, string? adminNote = null)
        {
            var material = await _materialRepository.GetByIdAsync(materialId);
            if (material == null) return false;

            material.ApprovalStatus = approve ? "Approved" : "Rejected";
            material.IsAvailable = approve; // only available when approved
            if (!string.IsNullOrWhiteSpace(adminNote))
            {
                material.AdminNote = adminNote;
            }
            material.LastUpdated = DateTime.UtcNow;

            await _materialRepository.UpdateAsync(material);
            await _materialRepository.Commit();

            if (approve)
            {
                await EnsureInventoryForApprovedMaterialAsync(material);
            }

            // Send notification to supplier about approval status
            await _notificationService.CreateMaterialApprovalNotificationAsync(materialId, material.SupplierId, material.ApprovalStatus, adminNote);

            return true;
        }

        // Tự động tạo kho mặc định cho supplier nếu chưa có
        private async Task EnsureInventoryForApprovedMaterialAsync(Material material)
        {
            // 1) Tạo kho mặc định cho supplier nếu chưa có
            var warehouse = await _materialRepository.GetDefaultWarehouseBySupplierIdAsync(material.SupplierId);

            if (warehouse == null)
            {
                warehouse = new Warehouse
                {
                    Name = "Kho nhà cung cấp",
                    WarehouseType = "Material",
                    SupplierId = material.SupplierId,
                    IsDefault = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                await _materialRepository.AddWarehouseAsync(warehouse);
                await _materialRepository.Commit();
            }

            // 2) Tạo dòng tồn cho material ở kho mặc định nếu chưa có
            var stock = await _materialRepository.GetMaterialStockAsync(material.MaterialId, warehouse.WarehouseId);

            if (stock == null)
            {
                // Khởi tạo tồn kho về 0 khi approve (theo yêu cầu business),
                // supplier sẽ chủ động nhập kho sau đó
                var initialQuantity = 0m;

                stock = new MaterialStock
                {
                    MaterialId = material.MaterialId,
                    WarehouseId = warehouse.WarehouseId,
                    // Khởi tạo bằng 0 thay vì đồng bộ QuantityAvailable ban đầu
                    QuantityOnHand = initialQuantity,
                    MinThreshold = 0m,
                    LastUpdated = DateTime.UtcNow
                };
                await _materialRepository.AddMaterialStockAsync(stock);
                await _materialRepository.Commit();

                // Không tạo transaction nhập kho tự động vì số lượng khởi tạo là 0
            }

            // 3) Đồng bộ tổng về Material để homepage hiển thị Material (not in stock)
            var total = await _materialRepository.GetTotalQuantityOnHandAsync(material.MaterialId);

            // Đồng bộ QuantityAvailable theo tồn kho thực tế (0 sau approve)
            material.QuantityAvailable = (int)total;
            material.LastUpdated = DateTime.UtcNow;
            await _materialRepository.UpdateAsync(material);
            await _materialRepository.Commit();
        }

        // Delete material with business validation
        public async Task<bool> DeleteMaterialAsync(int materialId)
        {
            var material = await _materialRepository.GetByIdAsync(materialId);
            if (material == null)
                return false;

            // TODO: Add business validation for deletion (e.g., check if material is in use in orders)

            _materialRepository.Remove(material);
            await _materialRepository.Commit();

            return true;
        }

        /// <summary>
        /// Calculate sustainability score for a material (delegation to SustainabilityService)
        /// </summary>
        private async Task<decimal?> GetMaterialSustainabilityScore(int materialId, SustainabilityService sustainabilityService)
        {
            try
            {
                var report = await sustainabilityService.CalculateMaterialSustainabilityScore(materialId);
                return report?.OverallSustainabilityScore;
            }
            catch
            {
                return null;
            }
        }
    }
}
