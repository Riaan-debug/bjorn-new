import { json } from "@/lib/api";
import { publicMenu } from "@/lib/db";

export async function GET() {
  return json(publicMenu());
}
