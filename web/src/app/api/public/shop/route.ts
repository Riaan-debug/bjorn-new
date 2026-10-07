import { json } from "@/lib/api";
import { publicShop } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return json(publicShop());
}
