import { getStaffSession, hasStaffPin } from "@/lib/auth";
import { json } from "@/lib/api";

export async function GET() {
  const session = await getStaffSession();
  return json({
    configured: hasStaffPin(),
    signedIn: Boolean(session),
    role: session?.role ?? null,
    name: session?.name ?? null,
    staffId: session?.staffId ?? null,
  });
}
