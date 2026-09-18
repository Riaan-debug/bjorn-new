import { z } from "zod";
import { asError, guardWrite, json, reject } from "@/lib/api";
import { requireStaff } from "@/lib/auth";
import { store } from "@/lib/db";
import { safeText, todayStr, uid } from "@/lib/security";

const schema = z.object({
  date: z.string().optional(),
  cups: z.number().min(0).max(10000),
  revenue: z.number().min(0).max(1000000),
  notes: z.string().max(400).optional().default(""),
});

export async function GET() {
  try {
    await requireStaff();
    return json(store.dailyLog());
  } catch (error) {
    return asError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireStaff();
    const blocked = guardWrite(request, "hub-daily", 30, 60 * 1000);
    if (blocked) return blocked;
    const body = schema.parse(await request.json());
    const date = body.date || todayStr();
    const list = store.dailyLog();
    const existing = list.find((e) => e.date === date);
    if (existing) {
      existing.cups = body.cups;
      existing.revenue = body.revenue;
      existing.notes = safeText(body.notes, 400);
    } else {
      list.unshift({
        id: uid(),
        date,
        cups: body.cups,
        revenue: body.revenue,
        notes: safeText(body.notes, 400),
      });
    }
    store.saveDailyLog(list);
    return json(list.find((e) => e.date === date));
  } catch (error) {
    if (error instanceof z.ZodError) return reject("Check the daily log details");
    return asError(error);
  }
}
