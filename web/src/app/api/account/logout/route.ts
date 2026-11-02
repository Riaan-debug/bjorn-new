import { asError, json } from "@/lib/api";
import { clearCustomerSession } from "@/lib/customer-auth";

export async function POST() {
  try {
    await clearCustomerSession();
    return json({ ok: true });
  } catch (error) {
    return asError(error);
  }
}
