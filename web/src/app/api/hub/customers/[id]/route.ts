import { z } from "zod";
import { asError, guardWrite, json, reject } from "@/lib/api";
import { requireOwner, requireStaff } from "@/lib/auth";
import { store } from "@/lib/db";
import { digits, safeText, todayStr } from "@/lib/security";

const schema = z.object({
  name: z.string().min(1).max(80).optional(),
  phone: z.string().min(7).max(20).optional(),
  notes: z.string().max(400).optional(),
  stampsDelta: z.number().int().min(-5).max(5).optional(),
  redeemFree: z.boolean().optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff();
    const blocked = guardWrite(request, "hub-customer", 60, 60 * 1000);
    if (blocked) return blocked;
    const { id } = await context.params;
    const body = schema.parse(await request.json());
    const list = store.customers();
    const customer = list.find((c) => c.id === id);
    if (!customer) return reject("Customer not found", 404);

    if (body.name) customer.name = safeText(body.name, 80);
    if (body.phone) customer.phone = digits(body.phone);
    if (body.notes !== undefined) customer.notes = safeText(body.notes, 400);
    if (body.stampsDelta) {
      customer.stamps = Math.max(0, (customer.stamps || 0) + body.stampsDelta);
      if (body.stampsDelta > 0) {
        customer.visits += 1;
        customer.lastVisit = todayStr();
        const need = store.settings().loyaltyFreeAt || 10;
        if (customer.stamps > 0 && customer.stamps % need === 0) customer.freeCoffees += 1;
      }
    }
    if (body.redeemFree) {
      const need = store.settings().loyaltyFreeAt || 10;
      if (customer.stamps < need) return reject("Not enough stamps yet");
      customer.stamps = 0;
    }

    store.saveCustomers(list);
    return json(customer);
  } catch (error) {
    if (error instanceof z.ZodError) return reject("Invalid update");
    return asError(error);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireOwner();
    const blocked = guardWrite(request, "hub-customer-del", 20, 60 * 1000);
    if (blocked) return blocked;
    const { id } = await context.params;
    store.saveCustomers(store.customers().filter((c) => c.id !== id));
    return json({ ok: true });
  } catch (error) {
    return asError(error);
  }
}
