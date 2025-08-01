import { z } from "zod";

// Helper function để tạo nullable string schema
const nullableString = () => z.string().nullable().optional();

// Schema cho Sustainability Criterion (theo MaterialSustainabilityCriterionDto)
export const sustainabilityCriterionSchema = z.object({
  criterionId: z.number(),
  name: nullableString(),
  description: nullableString(),
  unit: nullableString(),
  value: z.number(),
});

// Schema cho Material Type Benchmark (theo MaterialTypeBenchmarkModel)
export const materialTypeBenchmarkSchema = z.object({
  benchmarkId: z.number(),
  typeId: z.number(),
  criteriaId: z.number(),
  value: z.number(), // Giá trị chuẩn (benchmark)
  materialType: z.object({
    typeId: z.number(),
    typeName: nullableString(),
    description: nullableString(),
    category: nullableString(),
    isOrganic: z.boolean(),
    isRecycled: z.boolean(),
    sustainabilityNotes: nullableString(),
    displayOrder: z.number(),
    isActive: z.boolean(),
  }).optional(),
  sustainabilityCriteria: z.object({
    criterionId: z.number(),
    name: nullableString(),
    description: nullableString(),
    unit: nullableString(),
    weight: z.number(),
    thresholds: nullableString(),
    isActive: z.boolean(),
    displayOrder: z.number(),
  }).optional(),
  // Thêm các trường so sánh
  actualValue: z.number().nullable().optional(), // Giá trị thực tế của material
  improvementPercentage: z.number().nullable().optional(), // Phần trăm cải thiện
  improvementStatus: nullableString(), // Trạng thái: "Tốt hơn", "Kém hơn", "Bằng"
  improvementColor: nullableString(), // Màu sắc: "success", "error", "warning"
});

// Schema cho Supplier Public Info (theo SupplierPublicModel từ backend)
export const supplierPublicSchema = z.object({
  supplierId: z.string(), // Guid được serialize thành string
  supplierName: nullableString(),
  avatarUrl: nullableString(),
  bio: nullableString(),
  specializationUrl: nullableString(),
  portfolioUrl: nullableString(),
  portfolioFiles: nullableString(),
  bannerUrl: nullableString(),
  email: nullableString(),
  phoneNumber: nullableString(),
  address: nullableString(),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  certificates: nullableString(),
  createdAt: z.string(), // DateTime được serialize thành string
  userFullName: nullableString(),
});

// Schema cho Material Detail DTO (theo MaterialDetailDto từ backend)
export const materialDetailDtoSchema = z.object({
  materialId: z.number(),
  name: nullableString(),
  description: nullableString(),
  materialTypeName: nullableString(),
  recycledPercentage: z.number(),
  quantityAvailable: z.number(),
  pricePerUnit: z.number(),
  createdAt: nullableString(), // DateTime được serialize thành string
  lastUpdated: nullableString(), // DateTime được serialize thành string
  carbonFootprint: z.number().optional(),
  carbonFootprintUnit: nullableString(),
  waterUsage: z.number().optional(),
  waterUsageUnit: nullableString(),
  wasteDiverted: z.number().optional(),
  wasteDivertedUnit: nullableString(),
  productionCountry: nullableString(),
  productionRegion: nullableString(), // Thêm field mới
  manufacturingProcess: nullableString(),
  certificationDetails: nullableString(),
  certificationExpiryDate: nullableString(), // DateTime được serialize thành string
  transportDistance: z.number().nullable().optional(), // Thêm field mới
  transportMethod: nullableString(), // Thêm field mới
  approvalStatus: nullableString(),
  adminNote: nullableString(),
  isAvailable: z.boolean(),
  imageUrls: z.array(z.string()).optional(),
  supplierName: nullableString(),
  supplierId: nullableString(), // Guid được serialize thành string
  documentationUrl: nullableString(),
  
  // Sustainability fields
  sustainabilityScore: z.number().optional(),
  sustainabilityLevel: nullableString(),
  sustainabilityColor: nullableString(),
  
  // Supplier object
  supplier: supplierPublicSchema.optional(),
  
  // Sustainability criteria
  sustainabilityCriteria: z.array(sustainabilityCriterionSchema).optional(),
  
  // Benchmarks
  benchmarks: z.array(materialTypeBenchmarkSchema).optional(),
});

// Schema cho Material Detail Response (theo MaterialDetailResponse từ backend)
export const materialDetailResponseSchema = z.object({
  materialId: z.number(),
  materialTypeName: nullableString(),
  name: nullableString(),
  description: nullableString(),
  recycledPercentage: z.number(),
  quantityAvailable: z.number(),
  pricePerUnit: z.number(),
  documentationUrl: nullableString(),
  createdAt: z.string(),
  lastUpdated: z.string(),
  carbonFootprint: z.number().optional(),
  carbonFootprintUnit: nullableString(),
  waterUsage: z.number().optional(),
  waterUsageUnit: nullableString(),
  wasteDiverted: z.number().optional(),
  wasteDivertedUnit: nullableString(),
  productionCountry: nullableString(),
  productionRegion: nullableString(), // Thêm field mới
  manufacturingProcess: nullableString(),
  certificationDetails: nullableString(),
  certificationExpiryDate: nullableString(),
  transportDistance: z.number().nullable().optional(), // Thêm field mới
  transportMethod: nullableString(), // Thêm field mới
  approvalStatus: nullableString(),
  adminNote: nullableString(),
  isAvailable: z.boolean(),
  imageUrls: z.array(z.string()).optional(),
  sustainabilityCriteria: z.array(sustainabilityCriterionSchema),
  benchmarks: z.array(materialTypeBenchmarkSchema),
  supplier: supplierPublicSchema.optional(), // Sử dụng schema mới
  sustainabilityScore: z.number().optional(),
  sustainabilityLevel: nullableString(),
  sustainabilityColor: nullableString(),
});

// Schema cho Material Type Model (theo MaterialTypeModel từ backend)
export const materialTypeModelSchema = z.object({
  typeId: z.number(),
  typeName: nullableString(),
  description: nullableString(),
  category: nullableString(),
  isOrganic: z.boolean(),
  isRecycled: z.boolean(),
  sustainabilityNotes: nullableString(),
  displayOrder: z.number(),
  isActive: z.boolean(),
});

// Schema cho Material Model (theo MaterialModel từ backend)
export const materialModelSchema = z.object({
  materialId: z.number(),
  name: nullableString(),
  description: nullableString(),
  recycledPercentage: z.number(),
  quantityAvailable: z.number(),
  pricePerUnit: z.number(),
  documentationUrl: nullableString(),
  carbonFootprint: z.number().optional(),
  carbonFootprintUnit: nullableString(),
  waterUsage: z.number().optional(),
  waterUsageUnit: nullableString(),
  wasteDiverted: z.number().optional(),
  wasteDivertedUnit: nullableString(),
  productionCountry: nullableString(),
  productionRegion: nullableString(), // Thêm field mới
  manufacturingProcess: nullableString(),
  certificationDetails: nullableString(),
  certificationExpiryDate: nullableString(),
  transportDistance: z.number().nullable().optional(), // Thêm field mới
  transportMethod: nullableString(), // Thêm field mới
  approvalStatus: nullableString(),
  adminNote: nullableString(),
  isAvailable: z.boolean(),
  lastUpdated: z.string(),
  createdAt: z.string(),
  materialType: materialTypeModelSchema.optional(),
  supplier: supplierPublicSchema.optional(), // Sử dụng schema mới
});

// Schema cho Material Creation Form Request (theo MaterialCreationFormRequest từ backend)
export const materialCreationFormRequestSchema = z.object({
  name: z.string(),
  description: nullableString(),
  materialTypeId: z.number(),
  recycledPercentage: z.number(),
  quantityAvailable: z.number(),
  pricePerUnit: z.number(),
  documentationUrl: nullableString(),
  carbonFootprint: z.number().optional(),
  carbonFootprintUnit: nullableString(),
  waterUsage: z.number().optional(),
  waterUsageUnit: nullableString(),
  wasteDiverted: z.number().optional(),
  wasteDivertedUnit: nullableString(),
  productionCountry: nullableString(),
  productionRegion: nullableString(),
  manufacturingProcess: nullableString(),
  certificationDetails: nullableString(),
  certificationExpiryDate: nullableString(),
  organicCertificationType: nullableString(),
  qualityStandards: nullableString(),
  transportDistance: z.number().nullable().optional(), // Thêm field mới
  transportMethod: nullableString(), // Thêm field mới
  sustainabilityCriteria: z.array(z.object({
    criterionId: z.number(),
    value: z.number(),
  })),
});

// Schema cho Material Filter Request
export const materialFilterSchema = z.object({
  materialTypeId: z.number().optional(),
  supplierId: nullableString(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minRecycledPercentage: z.number().optional(),
  maxRecycledPercentage: z.number().optional(),
  isAvailable: z.boolean().optional(),
  approvalStatus: nullableString(),
});

// Schema cho Material Search Request
export const materialSearchSchema = z.object({
  keyword: nullableString(),
  supplierId: nullableString(),
});

// Schema cho Material API Response
export const materialApiResponseSchema = z.object({
  success: z.boolean(),
  message: nullableString(),
  data: z.union([
    materialDetailDtoSchema,
    z.array(materialDetailDtoSchema),
    materialTypeModelSchema,
    z.array(materialTypeModelSchema),
  ]).optional(),
  errorMessage: nullableString(),
});

// Export types
export type SustainabilityCriterionDto = z.infer<typeof sustainabilityCriterionSchema>;
export type MaterialTypeBenchmarkDto = z.infer<typeof materialTypeBenchmarkSchema>;
export type SupplierPublicDto = z.infer<typeof supplierPublicSchema>;
export type MaterialDetailResponse = z.infer<typeof materialDetailResponseSchema>;
export type MaterialDetailDto = z.infer<typeof materialDetailDtoSchema>;
export type MaterialTypeModel = z.infer<typeof materialTypeModelSchema>;
export type MaterialModel = z.infer<typeof materialModelSchema>;
export type MaterialCreationFormRequest = z.infer<typeof materialCreationFormRequestSchema>;
export type MaterialFilterRequest = z.infer<typeof materialFilterSchema>;
export type MaterialSearchRequest = z.infer<typeof materialSearchSchema>;
export type MaterialApiResponse = z.infer<typeof materialApiResponseSchema>; 