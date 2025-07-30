import { z } from "zod";
// Schema cho form Apply Designer
// Sử dụng Zod để xác định các trường và kiểu dữ liệu
export const MaterialSchema = z.object({
  materialId: z.number(),
  persentageUsed: z.number().min(0).max(100),
  meterUsed: z.number().min(0),
});

// Schema cho feature (tương ứng CreateDesignFeatureRequest)
export const DesignFeatureSchema = z.object({
  ReduceWaste: z.boolean(),
  LowImpactDyes: z.boolean(),
  Durable: z.boolean(),
  EthicallyManufactured: z.boolean(),
});

export const CreateDesignSchema = z.object({
  Name: z.string().optional(),
  Description: z.string().optional(),
  RecycledPercentage: z.number().min(0).max(100),
  CareInstructions: z.string().optional(),
  Price: z.number().min(0),
  ProductScore: z.number().int().min(0),
  Status: z.string().optional(),
  DesignTypeId: z.number().int().optional(),

  Feature: DesignFeatureSchema,

  MaterialsJson: z.string().refine(
    (val) => {
      try {
        const parsed = JSON.parse(val);
        return (
          Array.isArray(parsed) &&
          parsed.every((m) => MaterialSchema.safeParse(m).success)
        );
      } catch {
        return false;
      }
    },
    {
      message: "materialsJson must be a valid JSON string of material objects",
    }
  ),

  imageFiles: z.any().optional(), // Bạn sẽ xử lý file bên ngoài, ví dụ thông qua `FormData` và `input[type=file]`
});

export type CreateDesignFormValues = z.infer<typeof CreateDesignSchema>;

// Schema cho Response từ API
export const createDesignModelResponseSchema = z.object({
  Name: z.string().optional(),
  Description: z.string().optional(),
  RecycledPercentage: z.number().min(0).max(100),
  CareInstructions: z.string().optional(),
  Price: z.number().min(0),
  ProductScore: z.number().int().min(0),
  Status: z.string().optional(),
  DesignTypeId: z.number().int().optional(),

  Feature: DesignFeatureSchema,

  MaterialsJson: z.string().refine(
    (val) => {
      try {
        const parsed = JSON.parse(val);
        return (
          Array.isArray(parsed) &&
          parsed.every((m) => MaterialSchema.safeParse(m).success)
        );
      } catch {
        return false;
      }
    },
    {
      message: "materialsJson must be a valid JSON string of material objects",
    }
  ),

  ImageFiles: z.string().url().optional().or(z.literal("")),
});

export type CreateDesignModelResponse = z.infer<
  typeof createDesignModelResponseSchema
>;
