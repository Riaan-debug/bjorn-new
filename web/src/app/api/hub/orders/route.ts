import { z } from "zod";
import { asError, guardWrite, json, reject } from "@/lib/api";
import { requireStaff } from "@/lib/auth";
import { store } from "@/lib/db";
import type { OrderStatus } from "@/lib/types";

const statuses = ["new", "ready", "collected", "cancelled"] as const;

export async function GET() {
  try {
    await requireStaff();
    return json(store.orders());
  } catch (error) {
    return asError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireStaff();
    const blocked = guardWrite(request, "hub-orders", 40, 60 * 1000);
    if (blocked) return blocked;
    const body = z
      .object({
        id: z.string().min(1).max(40),
        status: z.enum(statuses),
      })
      .parse(await request.json());
    const result = store.setOrderStatus(body.id, body.status as OrderStatus);
    if (!result.ok) return reject(result.error, result.error === "Order not found" ? 404 : 400);
    return json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return reject("Could not update that order");
    return asError(error);
  }
}
