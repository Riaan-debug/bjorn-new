import { json } from "@/lib/api";
import { publicSettings } from "@/lib/db";

export async function GET() {
  return json(publicSettings());
}
