import { z } from "zod";

export const OrderItemInput = z.object({
  productId: z.string().min(1),
  title: z.string().min(1),
  price: z.union([z.number().int().nonnegative(), z.string().regex(/^\d+$/)]),
  qty: z.number().int().positive(),
  type: z.literal("digital"),
});

export const OrderPostInput = z.object({
  customerName: z.string().min(1).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().min(5).optional(),
  notes: z.string().optional(),
  shippingZone: z.string().min(1),
  shippingFee: z.union([z.number().int().nonnegative(), z.string().regex(/^\d+$/)]),
  subtotal: z.union([z.number().int().nonnegative(), z.string().regex(/^\d+$/)]),
  total: z.union([z.number().int().nonnegative(), z.string().regex(/^\d+$/)]),
  items: z.array(OrderItemInput).min(1),
});
