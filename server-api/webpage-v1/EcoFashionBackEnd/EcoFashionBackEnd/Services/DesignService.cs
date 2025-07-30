using EcoFashionBackEnd.Common.Payloads.Requests;
using EcoFashionBackEnd.Entities;
using EcoFashionBackEnd.Repositories;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using EcoFashionBackEnd.Dtos;
using EcoFashionBackEnd.Dtos.Design;
using CloudinaryDotNet.Actions;
using Newtonsoft.Json;

namespace EcoFashionBackEnd.Services
{
    public class DesignService
    {
        private readonly IRepository<Design, int> _designRepository;
        private readonly IRepository<DesignFeature, int> _designsFeatureRepository;
        private readonly IRepository<DesignsVariant, int> _designsVarientRepository;
        private readonly IRepository<DesignsMaterial, int> _designMaterialRepository;
        private readonly IRepository<Image, int> _imageRepository;
        private readonly IRepository<DesignImage, int> _designImageRepository;
        private readonly AppDbContext _dbContext;
        private readonly IMapper _mapper;
        private readonly CloudService _cloudService;

        public DesignService(
            IRepository<Design, int> designRepository,
            IRepository<DesignFeature, int> designsFeatureRepository,
            IRepository<DesignsVariant, int> designsVarientRepository,
            IRepository<DesignsMaterial, int> designsMaterialRepository,
            IRepository<Image, int> imageRepository,
            IRepository<DesignImage, int> designImageRepository,
            AppDbContext dbContext,
            IMapper mapper,
            CloudService cloudService)
        {
            _designRepository = designRepository;
            _designsFeatureRepository = designsFeatureRepository;
            _designsVarientRepository = designsVarientRepository;
            _designMaterialRepository = designsMaterialRepository;
            _imageRepository = imageRepository;
            _designImageRepository = designImageRepository;
            _dbContext = dbContext;
            _mapper = mapper;
            _cloudService = cloudService;
        }
        public async Task<DesignDetailDto?> GetDesignDetailById(int id)
        {
            var design = await _dbContext.Designs
                .Include(d => d.DesignTypes)
                .Include(d => d.DesignImages).ThenInclude(di => di.Image)
                .Include(d => d.DesignsFeature)
                .Include(d => d.DesignsVariants).ThenInclude(v => v.DesignsColor)
                .Include(d => d.DesignsVariants).ThenInclude(v => v.DesignsSize)
                .Include(d => d.DesignsMaterials)
                    .ThenInclude(dm => dm.Materials)
                        .ThenInclude(m => m.MaterialType)
                .Include(d => d.DesignsMaterials)
                    .ThenInclude(dm => dm.Materials)
                        .ThenInclude(m => m.MaterialSustainabilityMetrics)
                            .ThenInclude(ms => ms.SustainabilityCriterion)
                .Include(d => d.DesignsRatings)
                .Include(d => d.DesignerProfile)
                .FirstOrDefaultAsync(d => d.DesignId == id);

            if (design == null) return null;

            return new DesignDetailDto
            {
                DesignId = design.DesignId,
                Name = design.Name,
                Description = design.Description,
                RecycledPercentage = design.RecycledPercentage,
                CareInstructions = design.CareInstructions,
                Price = design.Price,
                ProductScore = design.ProductScore,
                Status = design.Status,
                CreatedAt = design.CreatedAt,

                DesignTypeName = design.DesignTypes?.DesignName,
                ImageUrls = design.DesignImages.Select(di => di.Image.ImageUrl).ToList(),

                Feature = design.DesignsFeature == null ? null : new DesignFeatureDto
                {
                    ReduceWaste = design.DesignsFeature.ReduceWaste,
                    LowImpactDyes = design.DesignsFeature.LowImpactDyes,
                    Durable = design.DesignsFeature.Durable,
                    EthicallyManufactured = design.DesignsFeature.EthicallyManufactured
                },

                Variants = design.DesignsVariants.Select(v => new VariantDto
                {
                    SizeName = v.DesignsSize?.SizeName ?? "",
                    ColorName = v.DesignsColor?.ColorName ?? "",
                    ColorCode = v.DesignsColor?.ColorCode ?? "",
                    Quantity = v.Quantity,
                    CarbonFootprint = v.CarbonFootprint,
                    WaterUsage = v.WaterUsage,
                    WasteDiverted = v.WasteDiverted
                }).ToList(),

                Materials = design.DesignsMaterials.Select(dm => new MaterialDto
                {
                    MaterialId = dm.MaterialId,
                    PersentageUsed = dm.PersentageUsed,
                    MeterUsed = dm.MeterUsed,
                    MaterialName = dm.Materials?.Name,
                    MaterialDescription = dm.Materials?.Description,
                    MaterialTypeName = dm.Materials?.MaterialType?.TypeName,


                    SustainabilityCriteria = dm.Materials?.MaterialSustainabilityMetrics?
                        .Select(ms => new SustainabilityCriterionDto
                        {
                            Criterion = ms.SustainabilityCriterion?.Name?.Trim().ToLower().Replace(" ", "_") ?? "",
                            Value = (decimal)ms.Value
                        })
                        .Where(dto => !string.IsNullOrEmpty(dto.Criterion))
                        .ToList() ?? new()
                }).ToList(),

                AvgRating = design.DesignsRatings.Any() ? design.DesignsRatings.Average(r => r.RatingScore) : null,
                ReviewCount = design.DesignsRatings.Count(),

                Designer = new DesignerPublicDto
                {
                    DesignerId = design.DesignerProfile.DesignerId,
                    DesignerName = design.DesignerProfile.DesignerName,
                    AvatarUrl = design.DesignerProfile.AvatarUrl,
                    Bio = design.DesignerProfile.Bio,
                    SpecializationUrl = design.DesignerProfile.SpecializationUrl,
                    PortfolioUrl = design.DesignerProfile.PortfolioUrl,
                    BannerUrl = design.DesignerProfile.BannerUrl,
                    Rating = design.DesignerProfile.Rating,
                    ReviewCount = design.DesignerProfile.ReviewCount,
                    Certificates = design.DesignerProfile.Certificates
                }
            };
        }


        public async Task<int> CreateDesign(CreateDesignRequest request, Guid designerId, List<IFormFile> imageFiles)
        {
            // Validate DesignTypeId
            if (!request.DesignTypeId.HasValue ||
                !await _dbContext.DesignsTypes.AnyAsync(dt => dt.DesignTypeId == request.DesignTypeId.Value))
            {
                throw new Exception("DesignTypeId không hợp lệ hoặc không tồn tại.");
            }


            // Map sang model
            var designModel = _mapper.Map<DesignModel>(request);
            designModel.DesignerId = designerId;
            designModel.CreatedAt = DateTime.UtcNow;

            // Model → Entity
            var design = _mapper.Map<Design>(designModel);
            await _designRepository.AddAsync(design);
            await _designRepository.Commit(); // commit để có DesignId

            // Tạo DesignFeature
            var featureModel = _mapper.Map<DesignFeatureModel>(request.Feature);
            featureModel.DesignId = design.DesignId;

            var feature = _mapper.Map<DesignFeature>(featureModel);
            await _designsFeatureRepository.AddAsync(feature);


            // Tạo DesignMaterials
            var materialRequests = new List<DesignMaterialRequest>();
            if (!string.IsNullOrWhiteSpace(request.MaterialsJson))
            {
                try
                {
                    materialRequests = JsonConvert.DeserializeObject<List<DesignMaterialRequest>>(request.MaterialsJson) ?? new();
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error parsing MaterialsJson: " + ex.Message);
                    throw new Exception("MaterialsJson không hợp lệ.");
                }
            }

            Console.WriteLine("Số lượng materials: " + materialRequests.Count);

            if (materialRequests.Any())
            {
                var materialModels = _mapper.Map<List<DesignMaterialModel>>(materialRequests);

                // Gán DesignId vào model trước khi map sang entity
                foreach (var model in materialModels)
                {
                    model.DesignId = design.DesignId;
                }

                var materialEntities = _mapper.Map<List<DesignsMaterial>>(materialModels);

                foreach (var material in materialEntities)
                {
                    await _designMaterialRepository.AddAsync(material);
                }
            }


            // Upload ảnh
            if (imageFiles?.Any() == true)
            {
                var uploadResults = await _cloudService.UploadImagesAsync(imageFiles);
                foreach (var uploadResult in uploadResults)
                {
                    if (!string.IsNullOrWhiteSpace(uploadResult?.SecureUrl?.ToString()))
                    {
                        var designImage = new DesignImage
                        {
                            DesignId = design.DesignId,
                            Image = new Image
                            {
                                ImageUrl = uploadResult.SecureUrl.ToString()
                            }
                        };

                        await _designImageRepository.AddAsync(designImage);
                    }
                    else
                    {
                        Console.WriteLine(" Upload failed or returned null SecureUrl.");
                    }
                }
            }

            await _designRepository.Commit();
            return design.DesignId;

        }

        //public async Task<IEnumerable<DesignModel>> GetAllDesigns()
        //{
        //    var designs = await _designRepository.GetAll().ToListAsync();
        //    return _mapper.Map<List<DesignModel>>(designs);
        //}
        public async Task<IEnumerable<DesignDetailDto?>> GetAllDesigns()
        {
            var designs = await _dbContext.Designs
                .Include(d => d.DesignTypes)
                .Include(d => d.DesignImages).ThenInclude(di => di.Image)
                .Include(d => d.DesignsMaterials)
                .Include(d => d.DesignsRatings)
                .Include(d => d.DesignerProfile)
                .ToListAsync();

            return designs.Select(design => new DesignDetailDto
            {
                DesignId = design.DesignId,
                Name = design.Name,
                RecycledPercentage = design.RecycledPercentage,
                Price = design.Price,
                ProductScore = design.ProductScore,
                Status = design.Status,
                CreatedAt = design.CreatedAt,

                DesignTypeName = design.DesignTypes?.DesignName,
                ImageUrls = design.DesignImages.Select(di => di.Image.ImageUrl).ToList(),

                Materials = design.DesignsMaterials.Select(dm => new MaterialDto
                {
                    PersentageUsed = dm.PersentageUsed,
                    MaterialName = dm.Materials?.Name,
                }).ToList(),

                AvgRating = design.DesignsRatings.Any() ? design.DesignsRatings.Average(r => r.RatingScore) : null,
                ReviewCount = design.DesignsRatings.Count(),

                Designer = new DesignerPublicDto
                {
                    DesignerName = design.DesignerProfile.DesignerName,
                }
            }).ToList();
        }

        public async Task<IEnumerable<DesignDetailDto?>> GetAllDesignsPagination(int page = 1, int pageSize = 12)
        {
            var designs = await _dbContext.Designs
                .AsNoTracking()
                .OrderByDescending(d => d.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(design => new DesignDetailDto
                {
                    DesignId = design.DesignId,
                    Name = design.Name,
                    RecycledPercentage = design.RecycledPercentage,
                    Price = design.Price,
                    ProductScore = design.ProductScore,
                    Status = design.Status,
                    CreatedAt = design.CreatedAt,

                    DesignTypeName = design.DesignTypes != null ? design.DesignTypes.DesignName : null,
                    ImageUrls = design.DesignImages
                        .Select(di => di.Image.ImageUrl)
                        .ToList(),

                    Materials = design.DesignsMaterials
                        .Select(dm => new MaterialDto
                        {
                            PersentageUsed = dm.PersentageUsed,
                            MaterialName = dm.Materials != null ? dm.Materials.Name : null
                        })
                        .ToList(),

                    AvgRating = design.DesignsRatings.Any() ? design.DesignsRatings.Average(r => r.RatingScore) : null,

                    ReviewCount = design.DesignsRatings.Count(),

                    Designer = design.DesignerProfile != null
                        ? new DesignerPublicDto
                        {
                            DesignerName = design.DesignerProfile.DesignerName
                        }
                        : null
                })
                .ToListAsync();

            return designs;
        }

        public async Task<bool> UpdateDesignVariants(int designId, UpdateDesignRequest request)
        {
            var design = await _dbContext.Designs
                .Include(d => d.DesignsVariants)
                .FirstOrDefaultAsync(d => d.DesignId == designId);

            if (design == null) return false;

            design.Name = request.Name;
            design.Description = request.Description;

            var existingVariants = design.DesignsVariants.ToList();
            foreach (var variantRequest in request.Variants)
            {
                if (variantRequest.Id.HasValue)
                {
                    var existing = existingVariants.FirstOrDefault(v => v.Id == variantRequest.Id.Value);
                    if (existing != null)
                    {
                        _mapper.Map(variantRequest, existing);
                    }
                }
                else
                {
                    var newEntity = _mapper.Map<DesignsVariant>(variantRequest);
                    newEntity.DesignId = designId;
                    _dbContext.DesignsVarients.Add(newEntity);
                }
            }

            var updatedIds = request.Variants.Where(v => v.Id.HasValue).Select(v => v.Id.Value).ToHashSet();
            var toRemove = existingVariants.Where(v => !updatedIds.Contains(v.Id)).ToList();
            _dbContext.DesignsVarients.RemoveRange(toRemove);

            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<DesignModel?> GetDesignById(int id)
        {
            var design = await _designRepository.GetByIdAsync(id);
            return _mapper.Map<DesignModel>(design);
        }

        public async Task<bool> DeleteDesign(int id)
        {
            var result = _designRepository.Remove(id);
            await _designRepository.Commit();
            return result != null;
        }

        public async Task<bool> AddVariantAndUpdateMaterialsAsync(CreateDesignVariantRequest request, int userId)
        {
            // Lấy DesignerId từ user
            var designerId = await _dbContext.Designers
                .Where(d => d.UserId == userId)
                .Select(d => d.DesignerId)
                .FirstOrDefaultAsync();

            if (designerId == Guid.Empty)
                throw new Exception("Người dùng không phải là nhà thiết kế.");

            // Lấy thiết kế và thông tin liên quan
            var design = await _dbContext.Designs
                .Include(d => d.DesignsMaterials)
                    .ThenInclude(dm => dm.Materials)
                        .ThenInclude(m => m.MaterialSustainabilityMetrics)
                            .ThenInclude(msm => msm.SustainabilityCriterion)
                .FirstOrDefaultAsync(d => d.DesignId == request.DesignId);

            if (design == null || design.DesignerId != designerId)
                throw new Exception("Không tìm thấy thiết kế hoặc bạn không có quyền tạo biến thể cho thiết kế này.");

            // Lấy size multiplier
            float sizeMultiplier = await _dbContext.TypeSizes
                .Where(ts => ts.DesignTypeId == design.DesignTypeId && ts.SizeId == request.SizeId)
                .Select(ts => ts.Ratio)
                .FirstOrDefaultAsync();

            if (sizeMultiplier == 0)
                throw new Exception("Không tìm thấy hệ số size phù hợp.");

            // Kiểm tra variant đã tồn tại chưa
            var existingVariant = await _dbContext.DesignsVarients
                .FirstOrDefaultAsync(v =>
                    v.DesignId == request.DesignId &&
                    v.SizeId == request.SizeId &&
                    v.ColorId == request.ColorId);

            // Tính tổng nguyên vật liệu cần dùng và kiểm tra kho
            foreach (var dm in design.DesignsMaterials)
            {
                float required = (float)(dm.MeterUsed * sizeMultiplier * request.Quantity);
                var inventory = await _dbContext.DesignerMaterialInventories
                    .FirstOrDefaultAsync(inv => inv.DesignerId == designerId && inv.MaterialId == dm.MaterialId);

                if (inventory == null || inventory.Quantity == null || inventory.Quantity < required)
                    throw new Exception($"Không đủ vật liệu [{dm.Materials.Name}] trong kho.");

                inventory.Quantity -= (int)Math.Ceiling(required);
            }

            if (existingVariant != null)
            {
                // Nếu đã tồn tại thì chỉ cộng thêm số lượng
                existingVariant.Quantity += request.Quantity;
            }
            else
            {
                // Tạo variant mới
                var newVariant = new DesignsVariant
                {
                    DesignId = request.DesignId,
                    SizeId = request.SizeId,
                    ColorId = request.ColorId,
                    Quantity = request.Quantity,
                };

                _dbContext.DesignsVarients.Add(newVariant);
            }

            await _dbContext.SaveChangesAsync();
            return true;
        }
    }
}