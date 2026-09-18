import { z } from "zod";
import { asError, guardWrite, json, reject } from "@/lib/api";
import { requireOwner } from "@/lib/auth";
import { store } from "@/lib/db";
import { safeText, uid } from "@/lib/security";
import type { MenuItem } from "@/lib/types";

const sizeSchema = z.object({
  sz: z.string().min(1).max(4),
  label: z.string().min(1).max(40),
  price: z.number().min(0).max(9999),
});

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(80),
  kind: z.enum(["drink", "food"]),
  cat: z.string().min(1).max(40),
  description: z.string().max(240).optional().default(""),
  active: z.boolean(),
  featured: z.boolean().optional().default(false),
  imagePath: z.string().max(200).optional().default(""),
  sizes: z.array(sizeSchema).min(1).max(6),
});

export async function GET() {
  try {
    await requireOwner();
    return json(store.menuItems());
  } catch (error) {
    return asError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireOwner();
    const blocked = guardWrite(request, "hub-menu", 40, 60 * 1000);
    if (blocked) return blocked;
    const body = schema.parse(await request.json());
    const list = store.menuItems();
    const item: MenuItem = {
      id: body.id || uid(),
      name: safeText(body.name, 80),
      kind: body.kind,
      cat: safeText(body.cat, 40),
      description: safeText(body.description, 240),
      active: body.active,
      featured: body.featured,
      imagePath: safeText(body.imagePath, 200),
      sizes: body.sizes,
    };
    const idx = list.findIndex((x) => x.id === item.id);
    if (idx >= 0) list[idx] = item;
    else list.push(item);
    store.saveMenuItems(list);
    return json(item);
  } catch (error) {
    if (error instanceof z.ZodError) return reject("Check the menu item details");
    return asError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireOwner();
    const blocked = guardWrite(request, "hub-menu-del", 20, 60 * 1000);
    if (blocked) return blocked;
    const { id } = z.object({ id: z.string() }).parse(await request.json());
    store.saveMenuItems(store.menuItems().filter((x) => x.id !== id));
    return json({ ok: true });
  } catch (error) {
    return asError(error);
  }
}
