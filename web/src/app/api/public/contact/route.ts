import { z } from "zod";
import { asError, guardWrite, json, reject } from "@/lib/api";
import { store } from "@/lib/db";
import { safeText, uid } from "@/lib/security";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  phone: z.string().max(40).optional().default(""),
  message: z.string().min(10).max(2000),
});

export async function POST(request: Request) {
  try {
    const blocked = guardWrite(request, "contact", 5, 60 * 60 * 1000);
    if (blocked) return blocked;

    const body = schema.parse(await request.json());
    const list = store.enquiries();
    list.unshift({
      id: uid(),
      name: safeText(body.name, 80),
      email: safeText(body.email, 120),
      phone: safeText(body.phone, 40),
      message: safeText(body.message, 2000),
      createdAt: new Date().toISOString(),
      read: false,
    });
    store.saveEnquiries(list.slice(0, 500));
    return json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return reject("Please check the form and try again");
    return asError(error);
  }
}
