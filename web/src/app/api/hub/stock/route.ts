import { z } from "zod";
import { asError, guardWrite, json, reject } from "@/lib/api";
import { requireStaff } from "@/lib/auth";
import { store } from "@/lib/db";
import { safeText, uid } from "@/lib/security";
import type { StockItem } from "@/lib/types";

const schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(80),
  cat: z.string().min(1).max(40),
  unit: z.string().min(1).max(20),
  count: z.number().min(0).max(100000),
  reorder: z.number().min(0).max(100000),
});

export async function GET() {
  try {
    await requireStaff();
    return json(store.stock());
  } catch (error) {
    return asError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireStaff();
    const blocked = guardWrite(request, "hub-stock", 40, 60 * 1000);
    if (blocked) return blocked;
    const body = schema.parse(await request.json());
    const list = store.stock();
    const item: StockItem = {
      id: body.id || uid(),
      name: safeText(body.name, 80),
      cat: safeText(body.cat, 40),
      unit: safeText(body.unit, 20),
      count: body.count,
      reorder: body.reorder,
    };
    const idx = list.findIndex((x) => x.id === item.id);
    if (idx >= 0) list[idx] = item;
    else list.push(item);
    store.saveStock(list);
    return json(item);
  } catch (error) {
    if (error instanceof z.ZodError) return reject("Check the stock item details");
    return asError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireStaff();
    const blocked = guardWrite(request, "hub-stock-del", 20, 60 * 1000);
    if (blocked) return blocked;
    const { id } = z.object({ id: z.string() }).parse(await request.json());
    store.saveStock(store.stock().filter((x) => x.id !== id));
    return json({ ok: true });
  } catch (error) {
    return asError(error);
  }
}
