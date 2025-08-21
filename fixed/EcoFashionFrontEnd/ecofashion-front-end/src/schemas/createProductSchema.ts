import { z } from "zod";
export const createProductSchema = z.object({
  designId: z.number(),

  images: z
    .any()
    // .refine((files) => Array.isArray(files) && files.length > 0, {
    //   message: "Cần Thêm Hình Ảnh",
    // })
    .nullable(),
});

export type CreateProductSchemaFormValues = z.infer<typeof createProductSchema>;

// Schema cho Response từ API
// Define the material response item schema
// Response schema
export const createProductModelResponseSchema = z.object({
  designId: z.number(),
  images: z.array(z.string().url()),
});

export type CreateProductModelResponse = z.infer<
  typeof createProductModelResponseSchema
>;
