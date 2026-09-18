import { z } from "zod";
import { asError, guardWrite, json, reject } from "@/lib/api";
import { createStaffSession, hasStaffPin, hashPin, validPin } from "@/lib/auth";
import { store } from "@/lib/db";
import { uid } from "@/lib/security";

const schema = z.object({ pin: z.string() });

export async function POST(request: Request) {
  try {
    const blocked = guardWrite(request, "setup", 5, 15 * 60 * 1000);
    if (blocked) return blocked;
    if (hasStaffPin()) return reject("Staff PIN already exists. Sign in instead.", 409);

    const body = schema.parse(await request.json());
    if (!validPin(body.pin)) return reject("PIN must be 4–8 digits");

    const account = {
      id: uid(),
      name: "Owner",
      role: "owner" as const,
      pinHash: await hashPin(body.pin),
    };
    store.saveAuth({ accounts: [account] });
    await createStaffSession(account);
    return json({ ok: true, role: account.role, name: account.name });
  } catch (error) {
    if (error instanceof z.ZodError) return reject("Invalid request");
    return asError(error);
  }
}
