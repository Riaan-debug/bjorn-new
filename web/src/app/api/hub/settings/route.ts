import { z } from "zod";
import { asError, guardWrite, json, reject } from "@/lib/api";
import { requireOwner } from "@/lib/auth";
import { store } from "@/lib/db";
import { DEFAULT_SETTINGS } from "@/lib/seed";

const schema = z.object({
  businessName: z.string().min(2).max(80),
  slogan: z.string().max(80),
  location: z.string().max(80),
  address: z.string().max(160),
  tradingHours: z.string().max(80),
  operatingDays: z.number().min(1).max(7),
  dailyCupTarget: z.number().min(1).max(10000),
  loyaltyFreeAt: z.number().min(3).max(30),
  instagramUrl: z.string().max(200),
  whatsappUrl: z.string().max(200),
  googleBizUrl: z.string().max(200),
  publicPhone: z.string().max(40),
  publicEmail: z.string().max(120),
  coffeeBlend: z.string().max(160),
  coffeeNotes: z.string().max(240),
});

export async function GET() {
  try {
    await requireOwner();
    return json(store.settings());
  } catch (error) {
    return asError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireOwner();
    const blocked = guardWrite(request, "hub-settings", 20, 60 * 1000);
    if (blocked) return blocked;
    const body = schema.parse(await request.json());
    const next = { ...DEFAULT_SETTINGS, ...store.settings(), ...body, seeded: true };
    store.saveSettings(next);
    return json(next);
  } catch (error) {
    if (error instanceof z.ZodError) return reject("Check the settings fields");
    return asError(error);
  }
}
