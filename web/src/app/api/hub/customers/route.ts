import { z } from "zod";
import { asError, guardWrite, json, reject } from "@/lib/api";
import { requireStaff } from "@/lib/auth";
import { store } from "@/lib/db";
import { digits, safeText, todayStr, uid } from "@/lib/security";

const schema = z.object({
  name: z.string().min(1).max(80),
  phone: z.string().min(7).max(20),
  notes: z.string().max(400).optional().default(""),
});

export async function GET() {
  try {
    await requireStaff();
    return json(store.customers());
  } catch (error) {
    return asError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireStaff();
    const blocked = guardWrite(request, "hub-customers", 40, 60 * 1000);
    if (blocked) return blocked;
    const body = schema.parse(await request.json());
    const phone = digits(body.phone);
    const existing = store.customers().find((c) => digits(c.phone) === phone);
    if (existing) return reject("A customer with that number already exists", 409);
    const customer = {
      id: uid(),
      name: safeText(body.name, 80),
      phone,
      dateJoined: todayStr(),
      lastVisit: todayStr(),
      visits: 0,
      stamps: 0,
      freeCoffees: 0,
      notes: safeText(body.notes, 400),
    };
    const list = store.customers();
    list.unshift(customer);
    store.saveCustomers(list);
    return json(customer, 201);
  } catch (error) {
    if (error instanceof z.ZodError) return reject("Name and a valid phone number are required");
    return asError(error);
  }
}
