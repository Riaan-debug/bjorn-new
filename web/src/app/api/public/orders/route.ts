import { z } from "zod";
import { asError, guardWrite, json, reject } from "@/lib/api";
import { getCustomerSession } from "@/lib/customer-auth";
import { saveCustomer } from "@/lib/customers";
import { isCollectDate } from "@/lib/dates";
import { sellable, store } from "@/lib/db";
import { safeText, todayStr, uid } from "@/lib/security";
import type { OrderLine, ShopOrder } from "@/lib/types";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  phone: z.string().min(7).max(40),
  collectDate: z.string().min(8).max(12),
  note: z.string().max(400).optional().default(""),
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(40),
        sizeId: z.string().min(1).max(40),
        qty: z.number().int().min(1).max(6),
      }),
    )
    .min(1)
    .max(12),
});

export async function POST(request: Request) {
  try {
    const blocked = guardWrite(request, "shop-order", 8, 60 * 60 * 1000);
    if (blocked) return blocked;

    const body = schema.parse(await request.json());
    if (!isCollectDate(body.collectDate)) {
      return reject("Choose a weekday, from tomorrow, within the next three weeks.");
    }

    const catalog = store.shopProducts().filter((product) => product.active);
    const merged = new Map<string, { productId: string; sizeId: string; qty: number }>();
    for (const line of body.items) {
      const key = `${line.productId}:${line.sizeId}`;
      const hit = merged.get(key);
      if (hit) hit.qty += line.qty;
      else merged.set(key, { ...line });
    }

    const items: OrderLine[] = [];
    for (const line of merged.values()) {
      if (line.qty > 6) return reject("Six of one size is the most in a single order.");
      const product = catalog.find((item) => item.id === line.productId);
      const size = product?.sizes.find((item) => item.id === line.sizeId && sellable(product, item));
      if (!product || !size) return reject("One of those items is no longer on the shop.");
      items.push({
        productId: product.id,
        name: product.name,
        sizeId: size.id,
        sizeLabel: size.label,
        grams: size.grams,
        price: size.price,
        qty: line.qty,
      });
    }

    const pieces = items.reduce((sum, item) => sum + item.qty, 0);
    if (pieces > 12) return reject("Twelve items is the most in a single order.");

    const session = await getCustomerSession();
    const id = uid();
    const order: ShopOrder = {
      id,
      number: `AP-${id.slice(0, 4).toUpperCase()}`,
      name: safeText(body.name, 80),
      email: safeText(body.email, 120),
      phone: safeText(body.phone, 40),
      collectDate: body.collectDate,
      note: safeText(body.note, 400),
      createdAt: new Date().toISOString(),
      status: "new",
      items,
      total: items.reduce((sum, item) => sum + item.price * item.qty, 0),
      customerId: session?.customerId,
    };

    const placed = store.placeOrder(order);
    if (!placed.ok) return reject(placed.error);
    if (session) {
      session.customer.bag = [];
      session.customer.lastVisit = todayStr();
      if (!session.customer.email) session.customer.email = safeText(body.email, 120);
      saveCustomer(session.customer);
    }
    return json({ id: order.id, number: order.number });
  } catch (error) {
    if (error instanceof z.ZodError) return reject("Please check the order and try again");
    return asError(error);
  }
}
