import { z } from "zod";
import { asError, guardWrite, json, reject } from "@/lib/api";
import { hashPin, validPin } from "@/lib/auth";
import { mergeBags } from "@/lib/bag";
import { createCustomerSession } from "@/lib/customer-auth";
import { cardPayload, findCustomerByPhone, saveCustomer } from "@/lib/customers";
import { digits, safeText, todayStr, uid } from "@/lib/security";

const schema = z.object({
  name: z.string().min(1).max(80),
  phone: z.string().min(7).max(20),
  pin: z.string(),
  email: z.string().max(120).optional().default(""),
  bag: z
    .array(
      z.object({
        productId: z.string().min(1).max(40),
        sizeId: z.string().min(1).max(40),
        qty: z.number().int().min(1).max(6),
      }),
    )
    .max(12)
    .optional()
    .default([]),
});

export async function POST(request: Request) {
  try {
    const blocked = guardWrite(request, "card-join", 8, 60 * 60 * 1000);
    if (blocked) return blocked;
    const body = schema.parse(await request.json());
    if (!validPin(body.pin)) return reject("PIN must be 4–8 digits");
    const email = body.email.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reject("Enter a valid email, or leave it blank");

    const phone = digits(body.phone);
    if (phone.length < 7) return reject("Enter a phone number");

    const existing = findCustomerByPhone(phone);
    if (existing?.pinHash) {
      return reject("This number already has a site PIN. Sign in instead.", 409);
    }

    const pinHash = await hashPin(body.pin);
    const bag = mergeBags(existing?.bag, body.bag);
    const customer = existing
      ? {
          ...existing,
          name: safeText(body.name, 80) || existing.name,
          phone: digits(existing.phone) || phone,
          email: email || existing.email || "",
          pinHash,
          bag,
        }
      : {
          id: uid(),
          name: safeText(body.name, 80),
          phone,
          email,
          dateJoined: todayStr(),
          lastVisit: todayStr(),
          visits: 0,
          stamps: 0,
          freeCoffees: 0,
          notes: "Joined on the site",
          pinHash,
          bag,
        };

    saveCustomer(customer);
    await createCustomerSession(customer.id);
    return json(cardPayload(customer), existing ? 200 : 201);
  } catch (error) {
    if (error instanceof z.ZodError) return reject("Name, phone, and a 4–8 digit PIN are required");
    return asError(error);
  }
}
