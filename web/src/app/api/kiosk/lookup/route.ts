import { z } from "zod";
import { asError, guardWrite, json, reject } from "@/lib/api";
import { store } from "@/lib/db";
import { digits } from "@/lib/security";

const schema = z.object({ phone: z.string().min(7).max(20) });

export async function POST(request: Request) {
  try {
    const blocked = guardWrite(request, "kiosk-lookup", 30, 60 * 1000);
    if (blocked) return blocked;
    const { phone } = schema.parse(await request.json());
    const norm = digits(phone);
    const match = store.customers().find((c) => {
      const cn = digits(c.phone);
      return cn && (cn === norm || cn.endsWith(norm) || norm.endsWith(cn));
    });
    if (!match) return json({ found: false });
    return json({
      found: true,
      customer: {
        id: match.id,
        name: match.name,
        stamps: match.stamps,
        visits: match.visits,
        freeCoffees: match.freeCoffees,
        lastVisit: match.lastVisit,
      },
      loyaltyFreeAt: store.settings().loyaltyFreeAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) return reject("Enter a phone number");
    return asError(error);
  }
}
