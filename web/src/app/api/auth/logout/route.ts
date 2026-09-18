import { clearStaffSession } from "@/lib/auth";
import { json } from "@/lib/api";

export async function POST() {
  await clearStaffSession();
  return json({ ok: true });
}
