import { z } from "zod";
import { asError, guardWrite, json, reject } from "@/lib/api";
import { validPin } from "@/lib/auth";
import { mergeBags } from "@/lib/bag";
import { createCustomerSession, customerPinMatches } from "@/lib/customer-auth";
import { cardPayload, findCustomerByPhone, saveCustomer } from "@/lib/customers";
import { digits } from "@/lib/security";

const schema = z.object({
  phone: z.string().min(7).max(20),
  pin: z.string(),
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
    const blocked = guardWrite(request, "card-login", 8, 15 * 60 * 1000);
    if (blocked) return blocked;
    const body = schema.parse(await request.json());
    if (!validPin(body.pin)) return reject("Phone or PIN is wrong", 401);

    const phone = digits(body.phone);
    const customer = findCustomerByPhone(phone);
    if (customer && !customer.pinHash) {
      return reject("This number has a stamp card but no site PIN yet. Join to choose one.", 409);
    }
    if (!customer || !(await customerPinMatches(customer, body.pin))) {
      return reject("Phone or PIN is wrong", 401);
    }

    customer.bag = mergeBags(customer.bag, body.bag);
    saveCustomer(customer);
    await createCustomerSession(customer.id);
    return json(cardPayload(customer));
  } catch (error) {
    if (error instanceof z.ZodError) return reject("Phone or PIN is wrong", 401);
    return asError(error);
  }
}
