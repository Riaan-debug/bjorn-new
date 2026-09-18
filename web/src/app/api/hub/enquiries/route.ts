import { z } from "zod";
import { asError, guardWrite, json } from "@/lib/api";
import { requireOwner, requireStaff } from "@/lib/auth";
import { store } from "@/lib/db";

export async function GET() {
  try {
    await requireStaff();
    return json(store.enquiries());
  } catch (error) {
    return asError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireStaff();
    const blocked = guardWrite(request, "hub-enquiries", 30, 60 * 1000);
    if (blocked) return blocked;
    const body = z.object({ id: z.string(), read: z.boolean() }).parse(await request.json());
    const list = store.enquiries();
    const item = list.find((e) => e.id === body.id);
    if (item) item.read = body.read;
    store.saveEnquiries(list);
    return json({ ok: true });
  } catch (error) {
    return asError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireOwner();
    const blocked = guardWrite(request, "hub-enquiries-del", 20, 60 * 1000);
    if (blocked) return blocked;
    const { id } = z.object({ id: z.string() }).parse(await request.json());
    store.saveEnquiries(store.enquiries().filter((e) => e.id !== id));
    return json({ ok: true });
  } catch (error) {
    return asError(error);
  }
}
