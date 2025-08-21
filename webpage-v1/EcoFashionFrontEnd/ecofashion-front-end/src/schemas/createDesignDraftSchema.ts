import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
});

export const CardsFormSchema = z.object({
  cards: z.array(CardDataSchema).min(1, "Cần ít nhất 1 nguyên liệu"),
});

export type CardsFormType = z.infer<typeof CardsFormSchema>;
