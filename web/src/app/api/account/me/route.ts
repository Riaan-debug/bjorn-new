import { asError, json } from "@/lib/api";
import { getCustomerSession } from "@/lib/customer-auth";
import { cardPayload } from "@/lib/customers";

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return json({ signedIn: false }, 401);
    }
    return json({ signedIn: true, ...cardPayload(session.customer) });
  } catch (error) {
    return asError(error);
  }
}
