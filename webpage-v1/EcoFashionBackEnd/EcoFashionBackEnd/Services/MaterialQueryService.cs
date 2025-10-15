using EcoFashionBackEnd.Entities;
using EcoFashionBackEnd.Repositories;

namespace EcoFashionBackEnd.Services
{
    /// <summary>
    /// Centralized query service for Material-related database operations
    /// Eliminates duplicate Include patterns across services
    /// </summary>
    public class MaterialQueryService
    {
        private readonly IMaterialRepository _materialRepository;

        public MaterialQueryService(IMaterialRepository materialRepository)
        {
            _materialRepository = materialRepository;
        }

        // Get single material by ID with full includes
        public async Task<Material?> GetMaterialByIdAsync(int materialId)
        {
            return await _materialRepository.GetMaterialByIdWithIncludesAsync(materialId);
        }

        // Get multiple materials by IDs with full includes
        public async Task<List<Material>> GetMaterialsByIdsAsync(List<int> materialIds)
        {
            return await _materialRepository.GetMaterialsByIdsAsync(materialIds);
        }

        // Get approved and available materials for public display
        public async Task<List<Material>> GetPublicMaterialsAsync()
        {
            return await _materialRepository.GetMaterialsWithFiltersAsync(
                isAvailable: true,
                approvalStatus: "Approved");
        }

        // Get all materials for admin (regardless of approval status)
        public async Task<List<Material>> GetAllMaterialsAdminAsync()
        {
            // Get all material IDs without filters
            var allMaterialIds = _materialRepository.GetAll().Select(m => m.MaterialId).ToList();
            return await _materialRepository.GetMaterialsByIdsAsync(allMaterialIds);
        }

        // Get materials by supplier
        public async Task<List<Material>> GetMaterialsBySupplierAsync(Guid supplierId)
        {
            return await _materialRepository.GetMaterialsWithFiltersAsync(supplierId: supplierId);
        }

        // Get materials by type (with approval filter)
        public async Task<List<Material>> GetMaterialsByTypeAsync(int typeId, bool approvedOnly = true)
        {
            if (approvedOnly)
            {
                return await _materialRepository.GetMaterialsWithFiltersAsync(
                    isAvailable: true,
                    approvalStatus: "Approved",
                    typeId: typeId);
            }

            return await _materialRepository.GetMaterialsWithFiltersAsync(typeId: typeId);
        }

        // Get materials with custom filters
        public async Task<List<Material>> GetMaterialsFilteredAsync(
            bool? isAvailable = null,
            string? approvalStatus = null,
            Guid? supplierId = null,
            int? typeId = null)
        {
            return await _materialRepository.GetMaterialsWithFiltersAsync(
                isAvailable: isAvailable,
                approvalStatus: approvalStatus,
                supplierId: supplierId,
                typeId: typeId);
        }

        // Get materials with comprehensive filtering for public/customer use
        public async Task<List<Material>> GetMaterialsWithComprehensiveFiltersAsync(
            bool? isAvailable = null,
            string? approvalStatus = null,
            int? typeId = null,
            Guid? supplierId = null,
            string? supplierName = null,
            string? materialName = null,
            string? productionCountry = null,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            int? minQuantity = null,
            bool? hasCertification = null,
            string? transportMethod = null,
            bool publicOnly = true)
        {
            // Default filter for public access - only approved and available materials
            if (publicOnly)
            {
                return await _materialRepository.GetMaterialsWithFiltersAsync(
                    isAvailable: true,
                    approvalStatus: "Approved",
                    typeId: typeId,
                    supplierId: supplierId,
                    supplierName: supplierName,
                    materialName: materialName,
                    productionCountry: productionCountry,
                    minPrice: minPrice,
                    maxPrice: maxPrice,
                    minQuantity: minQuantity,
                    hasCertification: hasCertification,
                    transportMethod: transportMethod);
            }

            return await _materialRepository.GetMaterialsWithFiltersAsync(
                isAvailable: isAvailable,
                approvalStatus: approvalStatus,
                typeId: typeId,
                supplierId: supplierId,
                supplierName: supplierName,
                materialName: materialName,
                productionCountry: productionCountry,
                minPrice: minPrice,
                maxPrice: maxPrice,
                minQuantity: minQuantity,
                hasCertification: hasCertification,
                transportMethod: transportMethod);
        }
    }
}
