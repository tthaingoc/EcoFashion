using AutoMapper;
using EcoFashionBackEnd.Dtos;
using EcoFashionBackEnd.Entities;
using EcoFashionBackEnd.Repositories;
using EcoFashionBackEnd.Common.Payloads.Requests;
using Microsoft.EntityFrameworkCore;

namespace EcoFashionBackEnd.Services
{
    public class MaterialTypeService
    {
        private readonly IRepository<MaterialType, int> _materialTypeRepository;

        private readonly IMapper _mapper;
        private readonly AppDbContext _appDbContext;
        public MaterialTypeService(IRepository<MaterialType, int> materialTypeRepository,
            IMapper mapper,
            AppDbContext dbContext)
        {
            _materialTypeRepository = materialTypeRepository;
            _mapper = mapper;
            _appDbContext = dbContext;
        }
        public async Task<MaterialTypeModel?> GetMaterialTypeByIdAsync(int id)
        {
            var materialType = await _materialTypeRepository.GetByIdAsync(id);
            if (materialType == null)
                return null;
            return _mapper.Map<MaterialTypeModel>(materialType);
        }
        public async Task<IEnumerable<MaterialTypeModel>> GetAllMaterialTypesAsync()
        {
            var materialTypes = await _materialTypeRepository.GetAll()
                                      .ToListAsync();
            return _mapper.Map<List<MaterialTypeModel>>(materialTypes);
        }
        public async Task<MaterialTypeModel> CreateMaterialTypeAsync(MaterialTypeRequest request)
        {
            var materialType = new MaterialType
            {
                TypeName = request.TypeName
            };
            await _materialTypeRepository.AddAsync(materialType);
            await _appDbContext.SaveChangesAsync();
            return _mapper.Map<MaterialTypeModel>(materialType);
        }
        public async Task<MaterialTypeModel?> UpdateMaterialTypeAsync(int id, MaterialTypeRequest model)
        {
            var materialType = await _materialTypeRepository.GetByIdAsync(id);
            if (materialType == null)
                return null;

            _mapper.Map(model, materialType);
            _materialTypeRepository.Update(materialType);
            await _appDbContext.SaveChangesAsync();

            return _mapper.Map<MaterialTypeModel>(materialType);
        }
        public async Task<bool> DeleteMaterialTypeAsync(int id)
        {
            var materialType = await _materialTypeRepository.GetByIdAsync(id);
            if (materialType == null)
                return false;

            _materialTypeRepository.Remove(id);
            await _appDbContext.SaveChangesAsync();
            return true;
        }
    }
}
