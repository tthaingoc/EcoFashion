using EcoFashionBackEnd.Entities;
using Microsoft.EntityFrameworkCore;

namespace EcoFashionBackEnd.Repositories;

public class MaterialRepository : GenericRepository<Material, int>, IMaterialRepository
{
    private readonly AppDbContext _dbContext;

    public MaterialRepository(AppDbContext dbContext) : base(dbContext)
    {
        _dbContext = dbContext;
    }

    // ========== Material Queries ==========

    // Get material by id with all related data (Images, Type, Supplier, Sustainability Metrics)
    public async Task<Material?> GetMaterialByIdWithIncludesAsync(int materialId)
    {
        return await GetMaterialsWithFullIncludes()
            .FirstOrDefaultAsync(m => m.MaterialId == materialId);
    }

    // Get multiple materials by IDs with full includes
    public async Task<List<Material>> GetMaterialsByIdsAsync(List<int> materialIds)
    {
        return await GetMaterialsWithFullIncludes()
            .Where(m => materialIds.Contains(m.MaterialId))
            .ToListAsync();
    }

    // Get material with images only
    public async Task<Material?> GetMaterialWithImagesAsync(int materialId)
    {
        return await _dbContext.Materials
            .Include(m => m.MaterialImages)
                .ThenInclude(mi => mi.Image)
            .FirstOrDefaultAsync(m => m.MaterialId == materialId);
    }

    // Get materials with comprehensive filtering
    public async Task<List<Material>> GetMaterialsWithFiltersAsync(
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
        string? transportMethod = null)
    {
        var query = GetMaterialsWithFullIncludes();

        if (isAvailable.HasValue)
            query = query.Where(m => m.IsAvailable == isAvailable.Value);

        if (!string.IsNullOrWhiteSpace(approvalStatus))
            query = query.Where(m => m.ApprovalStatus == approvalStatus);

        if (typeId.HasValue)
            query = query.Where(m => m.TypeId == typeId.Value);

        if (supplierId.HasValue)
            query = query.Where(m => m.SupplierId == supplierId.Value);

        if (!string.IsNullOrWhiteSpace(supplierName))
            query = query.Where(m => m.Supplier != null && m.Supplier.SupplierName.Contains(supplierName));

        if (!string.IsNullOrWhiteSpace(materialName))
            query = query.Where(m => m.Name != null && m.Name.Contains(materialName));

        if (!string.IsNullOrWhiteSpace(productionCountry))
            query = query.Where(m => m.ProductionCountry == productionCountry);

        if (minPrice.HasValue)
            query = query.Where(m => m.PricePerUnit >= minPrice.Value);

        if (maxPrice.HasValue)
            query = query.Where(m => m.PricePerUnit <= maxPrice.Value);

        if (minQuantity.HasValue)
            query = query.Where(m => m.QuantityAvailable >= minQuantity.Value);

        if (hasCertification.HasValue)
        {
            if (hasCertification.Value)
                query = query.Where(m => !string.IsNullOrEmpty(m.CertificationDetails));
            else
                query = query.Where(m => string.IsNullOrEmpty(m.CertificationDetails));
        }

        if (!string.IsNullOrWhiteSpace(transportMethod))
            query = query.Where(m => m.TransportMethod == transportMethod);

        return await query.ToListAsync();
    }

    // ========== Material Types ==========

    // Get material type by id
    public async Task<MaterialType?> GetMaterialTypeByIdAsync(int typeId)
    {
        return await _dbContext.MaterialTypes.FindAsync(typeId);
    }

    // Get material types by ids
    public async Task<List<MaterialType>> GetMaterialTypesByIdsAsync(List<int> typeIds)
    {
        return await _dbContext.MaterialTypes
            .Where(mt => typeIds.Contains(mt.TypeId))
            .ToListAsync();
    }

    // Get all active material types ordered by display order
    public async Task<List<MaterialType>> GetAllActiveMaterialTypesAsync()
    {
        return await _dbContext.MaterialTypes
            .Where(mt => mt.IsActive)
            .OrderBy(mt => mt.DisplayOrder)
            .ToListAsync();
    }

    // ========== Suppliers ==========

    // Check if supplier exists
    public async Task<bool> SupplierExistsAsync(Guid supplierId)
    {
        return await _dbContext.Suppliers.AnyAsync(s => s.SupplierId == supplierId);
    }

    // Check if material type exists
    public async Task<bool> MaterialTypeExistsAsync(int typeId)
    {
        return await _dbContext.MaterialTypes.AnyAsync(mt => mt.TypeId == typeId);
    }

    // ========== Material Images ==========

    // Add material image
    public async Task AddMaterialImageAsync(MaterialImage materialImage)
    {
        await _dbContext.MaterialImages.AddAsync(materialImage);
    }

    // ========== Sustainability ==========

    // Get active sustainability criteria IDs
    public async Task<List<int>> GetActiveSustainabilityCriteriaIdsAsync()
    {
        return await _dbContext.SustainabilityCriterias
            .Where(sc => sc.IsActive)
            .Select(sc => sc.CriterionId)
            .ToListAsync();
    }

    // Add sustainability metrics for material
    public async Task AddMaterialSustainabilityMetricsAsync(List<MaterialSustainability> metrics)
    {
        await _dbContext.MaterialSustainabilities.AddRangeAsync(metrics);
    }

    // ========== Benchmarks ==========

    // Get benchmarks for material type
    public async Task<List<MaterialTypeBenchmark>> GetBenchmarksByTypeIdAsync(int typeId)
    {
        return await _dbContext.MaterialTypesBenchmarks
            .Where(b => b.TypeId == typeId)
            .Include(b => b.SustainabilityCriteria)
            .ToListAsync();
    }

    // Get benchmarks for multiple material types
    public async Task<List<MaterialTypeBenchmark>> GetBenchmarksByTypeIdsAsync(List<int> typeIds)
    {
        return await _dbContext.MaterialTypesBenchmarks
            .Where(b => typeIds.Contains(b.TypeId))
            .Include(b => b.MaterialType)
            .Include(b => b.SustainabilityCriteria)
            .ToListAsync();
    }

    // ========== Warehouse & Inventory ==========

    // Get default warehouse for supplier
    public async Task<Warehouse?> GetDefaultWarehouseBySupplierIdAsync(Guid supplierId)
    {
        return await _dbContext.Warehouses
            .FirstOrDefaultAsync(w => w.SupplierId == supplierId && w.IsDefault);
    }

    // Add warehouse
    public async Task AddWarehouseAsync(Warehouse warehouse)
    {
        await _dbContext.Warehouses.AddAsync(warehouse);
    }

    // Get material stock by material and warehouse
    public async Task<MaterialStock?> GetMaterialStockAsync(int materialId, int warehouseId)
    {
        return await _dbContext.MaterialStocks
            .FirstOrDefaultAsync(s => s.MaterialId == materialId && s.WarehouseId == warehouseId);
    }

    // Add material stock
    public async Task AddMaterialStockAsync(MaterialStock stock)
    {
        await _dbContext.MaterialStocks.AddAsync(stock);
    }

    // Get total quantity on hand for material across all warehouses
    public async Task<decimal> GetTotalQuantityOnHandAsync(int materialId)
    {
        return await _dbContext.MaterialStocks
            .Where(s => s.MaterialId == materialId)
            .SumAsync(s => s.QuantityOnHand);
    }

    // ========== Private Helper Methods ==========

    // Base query with all includes for materials
    private IQueryable<Material> GetMaterialsWithFullIncludes()
    {
        return _dbContext.Materials
            .Include(m => m.MaterialType)
            .Include(m => m.Supplier)
                .ThenInclude(s => s!.User)
            .Include(m => m.MaterialImages)
                .ThenInclude(mi => mi.Image)
            .Include(m => m.MaterialSustainabilityMetrics)
                .ThenInclude(ms => ms.SustainabilityCriterion);
    }
}
