import { z } from "zod";
import { asError, guardWrite, json, reject } from "@/lib/api";
import { store } from "@/lib/db";
import { digits, safeText, todayStr, uid } from "@/lib/security";

const schema = z.object({
  name: z.string().min(1).max(80),
  phone: z.string().min(7).max(20),
});

export async function POST(request: Request) {
  try {
    const blocked = guardWrite(request, "kiosk-register", 10, 60 * 1000);
    if (blocked) return blocked;
    const body = schema.parse(await request.json());
    const phone = digits(body.phone);
    const existing = store.customers().find((c) => digits(c.phone) === phone);
    if (existing) {
      return json({
        customer: {
          id: existing.id,
          name: existing.name,
          stamps: existing.stamps,
          visits: existing.visits,
          freeCoffees: existing.freeCoffees,
          lastVisit: existing.lastVisit,
        },
        loyaltyFreeAt: store.settings().loyaltyFreeAt,
      });
    }
    const customer = {
      id: uid(),
      name: safeText(body.name, 80),
      phone,
      dateJoined: todayStr(),
      lastVisit: todayStr(),
      visits: 1,
      stamps: 1,
      freeCoffees: 0,
      notes: "Registered via kiosk",
    };
    const list = store.customers();
    list.unshift(customer);
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
      loyaltyFreeAt: store.settings().loyaltyFreeAt,
    }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) return reject("Name and phone number are required");
    return asError(error);
  }
}
