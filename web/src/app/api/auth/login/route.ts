import { z } from "zod";
import { asError, guardWrite, json, reject } from "@/lib/api";
import { createStaffSession, findAccountByPin, hasStaffPin, validPin } from "@/lib/auth";

const schema = z.object({ pin: z.string() });

export async function POST(request: Request) {
  try {
    const blocked = guardWrite(request, "login", 8, 15 * 60 * 1000);
    if (blocked) return blocked;
    if (!hasStaffPin()) return reject("Create a staff PIN first", 409);

    const body = schema.parse(await request.json());
    if (!validPin(body.pin)) return reject("PIN must be 4–8 digits");
    const account = await findAccountByPin(body.pin);
    if (!account) return reject("Wrong PIN", 401);

    await createStaffSession(account);
    return json({ ok: true, role: account.role, name: account.name });
  } catch (error) {
    if (error instanceof z.ZodError) return reject("Invalid request");
    return asError(error);
  }
}
