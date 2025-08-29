import { z } from "zod";

export const materialItemSchema = z.object({
  materialId: z.number(),
  percentageUsed: z.number().min(0).max(100), // sửa tên từ "persentageUsed" thành "percentageUsed"
  meterUsed: z.number().min(0),
});

export const draftPartSchema = z.object({
  name: z.string().min(1, "Tên phần thân áo là bắt buộc"),
  length: z.number().positive("Chiều dài phải là số dương"),
  width: z.number().positive("Chiều rộng phải là số dương"),
  quantity: z.number().int().positive("Số lượng phải là số nguyên dương"),
  materialId: z.number().int().positive("materialId phải là số nguyên dương"),
});

export const createDesignDraftSchema = z.object({
  name: z.string().min(1, { message: "Cần Thêm Tên Của Rập" }).nullable(),
  description: z.string().min(1, { message: "Cần Thêm Mô Tả Rập" }).nullable(),
  recycledPercentage: z
    .number()
    .min(0, { message: "Phần Trăm Bền Vững Ít Nhất Là 0" })
    .max(100, { message: "Phần Trăm Bền Vững Nhiều Nhất Là 100" }),

  designTypeId: z
    .number()
    .min(1, { message: "Cần Thêm Loại Của Sản Phẩm" })
    .nullable(),

  unitPrice: z.number().optional().nullable(), // decimal? tương đương số có thể null hoặc undefined
  salePrice: z.number().optional().nullable(),

  laborHours: z.number().optional().nullable(),
  laborCostPerHour: z.number().optional().nullable(),

  draftPartsJson: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val) return true; // allow null or undefined or empty string
        try {
          const parsed = JSON.parse(val);
          if (!Array.isArray(parsed)) return false;
          // Check each item with draftPartSchema
          return (
            Array.isArray(parsed) &&
            parsed.every((item) => draftPartSchema.safeParse(item).success)
          );
        } catch {
          return false;
        }
      },
      {
        message: "Cần Thêm Chất Liệu hợp lệ",
      }
    ),

  materialsJson: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (!val) return true; // allow null/undefined
        try {
          const parsed = JSON.parse(val);
          return (
            Array.isArray(parsed) &&
            parsed.every((item) => materialItemSchema.safeParse(item).success)
          );
        } catch {
          return false;
        }
      },
      { message: "Cần Thêm Chất Liệu hợp lệ" }
    ),

  totalCarbon: z.number(),
  totalWater: z.number(),
  totalWaste: z.number(),

  sketchImages: z
    .any()
    // .refine((files) => Array.isArray(files) && files.length > 0, {
    //   message: "Cần Thêm Hình Ảnh",
    // })
    .nullable(),
});

export type CreateDesignDraftFormValues = z.infer<
  typeof createDesignDraftSchema
>;

// Schema cho Response từ API
// Define the material response item schema
// Response schema
export const createDesignDraftModelResponseSchema = z.object({
  name: z.string(),
  description: z.string(),
  recycledPercentage: z.number(),
  designTypeId: z.number(),

  unitPrice: z.number(), // decimal? tương đương số có thể null hoặc undefined
  salePrice: z.number(),

  laborHours: z.number(),
  laborCostPerHour: z.number(),

  draftPartsJson: z.string(),
  materialsJson: z.array(materialItemSchema),

  totalCarbon: z.number(),
  totalWater: z.number(),
  totalWaste: z.number(),

  sketchImages: z.array(z.string().url()),
});

export type CreateDesignDraftModelResponse = z.infer<
  typeof createDesignDraftModelResponseSchema
>;

//Add card
const MaterialTypeSchema = z.object({
  typeId: z.number(),
  typeName: z.string(),
});

const MaterialSchema = z.object({
  materialId: z.number(),
  name: z.string(),
  pricePerUnit: z.number(),
  quantityAvailable: z.number(),
  carbonFootprint: z.number(),
  carbonFootprintUnit: z.string(),
  waterUsage: z.number(),
  waterUsageUnit: z.string(),
  wasteDiverted: z.number(),
  wasteDivertedUnit: z.string(),
  productionCountry: z.string(),
  productionRegion: z.string(),
  transportDistance: z.number(),
  transportMethod: z.string(),
  supplierName: z.string(),
  sustainabilityScore: z.number(),
  sustainabilityColor: z.string(),
  certificationDetails: z.string(),
});

export const CardDataSchema = z.object({
  id: z.string(),
  label: z.string(),
  draftName: z.string(),
  width: z.number(),
  height: z.number(),
  draftQuantity: z.number(),
  materialType: MaterialTypeSchema,
  material: MaterialSchema,
  materialStatus: z.number(),
});

export const CardsFormSchema = z.object({
  cards: z.array(CardDataSchema).min(1, "Cần ít nhất 1 nguyên liệu"),
});

export type CardsFormType = z.infer<typeof CardsFormSchema>;
