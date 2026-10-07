import { z } from "zod";
import { asError, guardWrite, json, reject } from "@/lib/api";
import { requireOwner } from "@/lib/auth";
import { store } from "@/lib/db";
import { safeText, uid } from "@/lib/security";
import type { ShopProduct } from "@/lib/types";

const schema = z.object({
  products: z
    .array(
      z.object({
        id: z.string().max(40).optional(),
        name: z.string().min(1).max(80),
        summary: z.string().max(240).optional().default(""),
        active: z.boolean(),
        imagePath: z.string().max(200).optional().default(""),
        behindPath: z.string().max(200).optional().default(""),
        sizes: z
          .array(
            z.object({
              id: z.string().max(40).optional(),
              label: z.string().min(1).max(40),
              grams: z.number().positive().max(5000),
              price: z.number().min(0).max(9999),
            }),
          )
          .min(1)
          .max(6),
      }),
    )
    .max(20),
});

export async function GET() {
  try {
    await requireOwner();
    return json(store.shopProducts());
  } catch (error) {
    return asError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireOwner();
    const blocked = guardWrite(request, "hub-shop", 30, 60 * 1000);
    if (blocked) return blocked;
    const body = schema.parse(await request.json());
    const products: ShopProduct[] = body.products.map((product) => ({
      id: product.id?.trim() || uid(),
      name: safeText(product.name, 80),
      summary: safeText(product.summary, 240),
      active: product.active,
      imagePath: safeText(product.imagePath, 200),
      behindPath: safeText(product.behindPath, 200),
      sizes: product.sizes.map((size) => ({
        id: size.id?.trim() || uid(),
        label: safeText(size.label, 40),
        grams: Math.round(size.grams),
        price: Math.round(size.price * 100) / 100,
      })),
    }));
    store.saveShopProducts(products);
    return json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return reject("Check each bag: it needs a name, a size, grams, and a price.");
    return asError(error);
  }
}
