using EcoFashionBackEnd.Entities;

namespace EcoFashionBackEnd.Repositories;

public interface IMaterialRepository : IRepository<Material, int>
{
    // ========== Material Queries ==========


    // Get material by id with all related data (Images, Type, Supplier, Sustainability Metrics)
    Task<Material?> GetMaterialByIdWithIncludesAsync(int materialId);


    // Get multiple materials by IDs with full includes
    Task<List<Material>> GetMaterialsByIdsAsync(List<int> materialIds);

    // Get material with images only
    Task<Material?> GetMaterialWithImagesAsync(int materialId);

    // Get materials with comprehensive filtering
    Task<List<Material>> GetMaterialsWithFiltersAsync(
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
        string? transportMethod = null);

    // ========== Material Types ==========

    // Get material type by id
    Task<MaterialType?> GetMaterialTypeByIdAsync(int typeId);


    // Get material types by ids
    Task<List<MaterialType>> GetMaterialTypesByIdsAsync(List<int> typeIds);

    // Get all active material types ordered by display order
    Task<List<MaterialType>> GetAllActiveMaterialTypesAsync();

    // ========== Suppliers ==========

    // Check if supplier exists
    Task<bool> SupplierExistsAsync(Guid supplierId);


    // Check if material type exists
    Task<bool> MaterialTypeExistsAsync(int typeId);

    // ========== Material Images ==========
    // Add material image
    Task AddMaterialImageAsync(MaterialImage materialImage);

    // ========== Sustainability ==========
    // Get active sustainability criteria IDs
    Task<List<int>> GetActiveSustainabilityCriteriaIdsAsync();

    // Add sustainability metrics for material
    Task AddMaterialSustainabilityMetricsAsync(List<MaterialSustainability> metrics);

    // ========== Benchmarks ==========
    // Get benchmarks for material type
    Task<List<MaterialTypeBenchmark>> GetBenchmarksByTypeIdAsync(int typeId);

    // Get benchmarks for multiple material types
    Task<List<MaterialTypeBenchmark>> GetBenchmarksByTypeIdsAsync(List<int> typeIds);


    // ========== Warehouse & Inventory ==========

    // Get default warehouse for supplier
    Task<Warehouse?> GetDefaultWarehouseBySupplierIdAsync(Guid supplierId);

    // Add warehouse
    Task AddWarehouseAsync(Warehouse warehouse);

    // Get material stock by material and warehouse
    Task<MaterialStock?> GetMaterialStockAsync(int materialId, int warehouseId);

    // Add material stock
    Task AddMaterialStockAsync(MaterialStock stock);

    // Get total quantity on hand for material across all warehouses
    Task<decimal> GetTotalQuantityOnHandAsync(int materialId);
}
