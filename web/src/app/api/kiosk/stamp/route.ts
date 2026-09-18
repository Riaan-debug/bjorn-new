import { z } from "zod";
import { asError, guardWrite, json, reject } from "@/lib/api";
import { pinMatches, validPin } from "@/lib/auth";
import { store } from "@/lib/db";
import { todayStr } from "@/lib/security";

const schema = z.object({
  id: z.string(),
  pin: z.string(),
});

export async function POST(request: Request) {
  try {
    const blocked = guardWrite(request, "kiosk-stamp", 20, 60 * 1000);
    if (blocked) return blocked;
    const body = schema.parse(await request.json());
    if (!validPin(body.pin) || !(await pinMatches(body.pin))) {
      return reject("Wrong staff PIN", 401);
    }
    const list = store.customers();
    const customer = list.find((c) => c.id === body.id);
    if (!customer) return reject("Customer not found", 404);
    const need = store.settings().loyaltyFreeAt || 10;
    customer.stamps += 1;
    customer.visits += 1;
    customer.lastVisit = todayStr();
    if (customer.stamps % need === 0) customer.freeCoffees += 1;
    store.saveCustomers(list);
    return json({
      customer: {
        id: customer.id,
        name: customer.name,
        stamps: customer.stamps,
        visits: customer.visits,
        freeCoffees: customer.freeCoffees,
        lastVisit: customer.lastVisit,
      },
      loyaltyFreeAt: need,
    });
  } catch (error) {
    if (error instanceof z.ZodError) return reject("Invalid request");
    return asError(error);
  }
}
