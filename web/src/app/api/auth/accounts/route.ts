import { z } from "zod";
import { asError, guardWrite, json, reject } from "@/lib/api";
import {
  canAddAccount,
  hashPin,
  listAccounts,
  ownerCount,
  pinTaken,
  publicAccounts,
  requireOwner,
  saveAccounts,
  validPin,
  validStaffName,
} from "@/lib/auth";
import { safeText, uid } from "@/lib/security";

const addSchema = z.object({
  name: z.string().min(1).max(40),
  pin: z.string(),
  role: z.enum(["owner", "staff"]).default("staff"),
});

const patchSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(40).optional(),
  role: z.enum(["owner", "staff"]).optional(),
  newPin: z.string().optional(),
});

export async function GET() {
  try {
    await requireOwner();
    return json(publicAccounts());
  } catch (error) {
    return asError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireOwner();
    const blocked = guardWrite(request, "auth-accounts", 12, 60 * 1000);
    if (blocked) return blocked;
    if (!canAddAccount()) return reject("Staff list is full");

    const body = addSchema.parse(await request.json());
    const name = safeText(body.name, 40);
    if (!validStaffName(name)) return reject("Enter a name");
    if (!validPin(body.pin)) return reject("PIN must be 4–8 digits");
    if (await pinTaken(body.pin)) return reject("That PIN is already in use");

    const accounts = listAccounts();
    accounts.push({
      id: uid(),
      name,
      role: body.role,
      pinHash: await hashPin(body.pin),
    });
    saveAccounts(accounts);
    return json(publicAccounts(), 201);
  } catch (error) {
    if (error instanceof z.ZodError) return reject("Check the name, PIN, and role");
    return asError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireOwner();
    const blocked = guardWrite(request, "auth-accounts-patch", 20, 60 * 1000);
    if (blocked) return blocked;

    const body = patchSchema.parse(await request.json());
    const accounts = listAccounts();
    const account = accounts.find((item) => item.id === body.id);
    if (!account) return reject("Person not found", 404);

    if (body.name) {
      const name = safeText(body.name, 40);
      if (!validStaffName(name)) return reject("Enter a name");
      account.name = name;
    }
    if (body.role && body.role !== account.role) {
      if (account.role === "owner" && ownerCount(accounts) < 2) {
        return reject("Keep at least one owner");
      }
      account.role = body.role;
    }
    if (body.newPin !== undefined) {
      if (!validPin(body.newPin)) return reject("PIN must be 4–8 digits");
      if (await pinTaken(body.newPin, account.id)) return reject("That PIN is already in use");
      account.pinHash = await hashPin(body.newPin);
    }

    saveAccounts(accounts);
    return json(publicAccounts());
  } catch (error) {
    if (error instanceof z.ZodError) return reject("Invalid update");
    return asError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireOwner();
    const blocked = guardWrite(request, "auth-accounts-del", 12, 60 * 1000);
    if (blocked) return blocked;

    const { id } = z.object({ id: z.string() }).parse(await request.json());
    if (id === session.staffId) return reject("You cannot remove your own login");

    const accounts = listAccounts();
    const account = accounts.find((item) => item.id === id);
    if (!account) return reject("Person not found", 404);
    if (account.role === "owner" && ownerCount(accounts) < 2) {
      return reject("Keep at least one owner");
    }

    saveAccounts(accounts.filter((item) => item.id !== id));
    return json(publicAccounts());
  } catch (error) {
    if (error instanceof z.ZodError) return reject("Invalid request");
    return asError(error);
  }
}
