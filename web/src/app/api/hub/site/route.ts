import { z } from "zod";
import { asError, guardWrite, json, reject } from "@/lib/api";
import { requireOwner } from "@/lib/auth";
import { store } from "@/lib/db";
import { mergeSite } from "@/lib/site";

const schema = z.object({
  special: z.object({
    active: z.boolean(),
    name: z.string().max(80),
    blurb: z.string().max(240),
    imagePath: z.string().max(200),
  }),
  photos: z.record(z.string(), z.string().max(200)),
});

export async function GET() {
  try {
    await requireOwner();
    return json(store.site());
  } catch (error) {
    return asError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireOwner();
    const blocked = guardWrite(request, "hub-site", 30, 60 * 1000);
    if (blocked) return blocked;
    const body = schema.parse(await request.json());
    const next = mergeSite(body);
    store.saveSite(next);
    return json(next);
  } catch (error) {
    if (error instanceof z.ZodError) return reject("Check the site fields");
    return asError(error);
  }
}
