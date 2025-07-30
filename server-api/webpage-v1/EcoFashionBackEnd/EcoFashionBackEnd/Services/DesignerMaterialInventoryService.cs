using AutoMapper;
using EcoFashionBackEnd.Common.Payloads.Requests;
using EcoFashionBackEnd.Dtos;
using EcoFashionBackEnd.Entities;
using EcoFashionBackEnd.Repositories;
using Microsoft.EntityFrameworkCore;

namespace EcoFashionBackEnd.Services
{
    public class DesignerMaterialInventoryService
    {
        IRepository<DesignerMaterialInventory, int> _inventoryRepository;
        private readonly IMapper _mapper;
        private readonly AppDbContext _dbContext;

        public DesignerMaterialInventoryService(IRepository<DesignerMaterialInventory, int> inventoryRepository,
            IMapper mapper,
            AppDbContext dbContext)
        {
            _inventoryRepository = inventoryRepository;
            _mapper = mapper;
            _dbContext = dbContext;
        }

        public async Task<IEnumerable<DesignerMaterialInventoryModel>> GetAllDesignerMaterialInventoriesAsync()
        {
            var inventories = await _dbContext.DesignerMaterialInventories
                .Include(dmi => dmi.Designer)
                .Include(dmi => dmi.Material)
                .ToListAsync();
            return _mapper.Map<List<DesignerMaterialInventoryModel>>(inventories);
        }

        public async Task<DesignerMaterialInventoryModel> GetDesignerMaterialInventoryByIdAsync(int id)
        {
            var inventory = await _dbContext.DesignerMaterialInventories
                .Include(dmi => dmi.Designer)
                .Include(dmi => dmi.Material)
                .FirstOrDefaultAsync(dmi => dmi.InventoryId == id);
            return _mapper.Map<DesignerMaterialInventoryModel>(inventory);
        }
        public async Task<DesignerMaterialInventoryModel> CreateDesignerMaterialInventoryAsync(int userId, CreateDesignerMaterialInventoryRequest request)
        {
            var designer = await _dbContext.Designers
                            .FirstOrDefaultAsync(d => d.UserId == userId);
            if (designer == null)
                throw new ArgumentException("Người dùng không phải là nhà thiết kế");
            var inventory = _mapper.Map<DesignerMaterialInventory>(request);
            inventory.Status = inventory.Quantity != 0
                ? "in_stock"
                : "out_of_stock";
            inventory.DesignerId = designer.DesignerId;
            inventory.LastBuyDate = DateTime.UtcNow;
            var addedInventory = await _inventoryRepository.AddAsync(inventory);
            await _dbContext.SaveChangesAsync();
            // Reload full object with Material and Designer
            var fullInventory = await _dbContext.DesignerMaterialInventories
                .Include(dmi => dmi.Designer)
                .Include(dmi => dmi.Material)
                .FirstOrDefaultAsync(dmi => dmi.InventoryId == addedInventory.InventoryId);
            return _mapper.Map<DesignerMaterialInventoryModel>(fullInventory);
        }
        public async Task<DesignerMaterialInventoryModel?> UpdateDesignerMaterialInventoryAsync(int userId, int inventoryId, UpdateDesignerMaterialInventoryRequest request)
        {
            var designer = await _dbContext.Designers
                            .FirstOrDefaultAsync(d => d.UserId == userId);
            if (designer == null)
                throw new ArgumentException("Người dùng không phải là nhà thiết kế");
            var inventory = await _inventoryRepository.GetByIdAsync(inventoryId);
            if (inventory == null)
                return null;
            if (inventory.DesignerId != designer.DesignerId)
                throw new ArgumentException("Bạn không có quyền sửa kho vật liệu này");
            _mapper.Map(request, inventory);
            inventory.Status = inventory.Quantity != 0
                ? "in_stock"
                : "out_of_stock";
            _inventoryRepository.Update(inventory);
            await _dbContext.SaveChangesAsync();
            return _mapper.Map<DesignerMaterialInventoryModel>(inventory);
        }
        public async Task<bool> DeleteDesignerMaterialInventoryAsync(int userId, int inventoryId)
        {
            var designer = await _dbContext.Designers
                            .FirstOrDefaultAsync(d => d.UserId == userId);
            if (designer == null)
                throw new ArgumentException("Người dùng không phải là nhà thiết kế");
            var inventory = await _inventoryRepository.GetByIdAsync(inventoryId);
            if (inventory == null)
                return false;
            if (inventory.DesignerId != designer.DesignerId)
                throw new ArgumentException("Bạn không có quyền xóa kho vật liệu này");
            _inventoryRepository.Remove(inventoryId);
            await _dbContext.SaveChangesAsync();
            return true;
        }
    }
}
