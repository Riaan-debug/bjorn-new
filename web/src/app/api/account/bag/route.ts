import { z } from "zod";
import { asError, guardWrite, json, reject } from "@/lib/api";
import { cleanBag } from "@/lib/bag";
import { getCustomerSession } from "@/lib/customer-auth";
import { saveCustomer } from "@/lib/customers";

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(40),
        sizeId: z.string().min(1).max(40),
        qty: z.number().int().min(1).max(6),
      }),
    )
    .max(12),
});

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) return json({ items: [] }, 401);
    return json({ items: cleanBag(session.customer.bag) });
  } catch (error) {
    return asError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCustomerSession();
    if (!session) return json({ items: [] }, 401);
    const blocked = guardWrite(request, "card-bag", 40, 60 * 1000);
    if (blocked) return blocked;
    const body = schema.parse(await request.json());
    session.customer.bag = cleanBag(body.items);
    saveCustomer(session.customer);
    return json({ items: session.customer.bag });
  } catch (error) {
    if (error instanceof z.ZodError) return reject("Could not save the bag");
    return asError(error);
  }
}
