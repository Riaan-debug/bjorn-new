import { compare } from "bcryptjs";
import { z } from "zod";
import { asError, guardWrite, json, reject } from "@/lib/api";
import { hashPin, listAccounts, pinTaken, requireStaff, saveAccounts, validPin } from "@/lib/auth";

const schema = z.object({
  currentPin: z.string(),
  newPin: z.string(),
});

export async function POST(request: Request) {
  try {
    const session = await requireStaff();
    const blocked = guardWrite(request, "change-pin", 8, 15 * 60 * 1000);
    if (blocked) return blocked;

    const body = schema.parse(await request.json());
    if (!validPin(body.currentPin) || !validPin(body.newPin)) {
      return reject("PIN must be 4–8 digits");
    }
    if (body.currentPin === body.newPin) return reject("Choose a different PIN");

    const accounts = listAccounts();
    const account = accounts.find((item) => item.id === session.staffId);
    if (!account) return reject("Sign in required", 401);

    if (!(await compare(body.currentPin, account.pinHash))) {
      return reject("Current PIN is wrong", 401);
    }
    if (await pinTaken(body.newPin, account.id)) {
      return reject("That PIN is already in use");
    }

    account.pinHash = await hashPin(body.newPin);
    saveAccounts(accounts);
    return json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) return reject("Invalid request");
    return asError(error);
  }
}
