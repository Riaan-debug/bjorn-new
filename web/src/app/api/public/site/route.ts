import { json } from "@/lib/api";
import { publicSite } from "@/lib/db";

export async function GET() {
  return json(publicSite());
}
