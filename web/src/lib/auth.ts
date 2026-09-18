import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";
import { store, type AuthAccount } from "./db";
import { uid, signPayload, verifyPayload } from "./security";
import type { StaffMember, StaffRole } from "./types";

const COOKIE = "ap_session";
const MAX_AGE = 60 * 60 * 12;
const MAX_ACCOUNTS = 20;

type Session = {
  role: StaffRole;
  staffId: string;
  name: string;
  iat: number;
  exp: number;
};

export async function hashPin(pin: string) {
  return hash(pin, 12);
}

export function listAccounts(): AuthAccount[] {
  const auth = store.auth();
  if (Array.isArray(auth.accounts) && auth.accounts.length) return auth.accounts;
  if (auth.pinHash) {
    const accounts: AuthAccount[] = [
      {
        id: uid(),
        name: "Owner",
        role: "owner",
        pinHash: auth.pinHash,
      },
    ];
    store.saveAuth({ accounts });
    return accounts;
  }
  return [];
}

export function saveAccounts(accounts: AuthAccount[]) {
  store.saveAuth({ accounts });
}

export function publicAccounts(): StaffMember[] {
  return listAccounts().map(({ id, name, role }) => ({ id, name, role }));
}

export function hasStaffPin() {
  return listAccounts().length > 0;
}

export async function findAccountByPin(pin: string) {
  if (!validPin(pin)) return null;
  let matched: AuthAccount | null = null;
  for (const account of listAccounts()) {
    if (await compare(pin, account.pinHash)) {
      if (!matched) matched = account;
    }
  }
  return matched;
}

export async function pinMatches(pin: string) {
  return Boolean(await findAccountByPin(pin));
}

export async function pinTaken(pin: string, exceptId?: string) {
  for (const account of listAccounts()) {
    if (exceptId && account.id === exceptId) continue;
    if (await compare(pin, account.pinHash)) return true;
  }
  return false;
}

export function ownerCount(accounts = listAccounts()) {
  return accounts.filter((account) => account.role === "owner").length;
}

export async function createStaffSession(account: Pick<AuthAccount, "id" | "name" | "role">) {
  const now = Math.floor(Date.now() / 1000);
  const token = signPayload({
    role: account.role,
    staffId: account.id,
    name: account.name,
    iat: now,
    exp: now + MAX_AGE,
  } satisfies Session);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearStaffSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getStaffSession() {
  const jar = await cookies();
  const session = verifyPayload<Session>(jar.get(COOKIE)?.value);
  if (!session?.staffId) return null;
  if (session.role !== "owner" && session.role !== "staff") return null;
  if (session.exp * 1000 < Date.now()) return null;
  const account = listAccounts().find((item) => item.id === session.staffId);
  if (!account) return null;
  return {
    ...session,
    role: account.role,
    name: account.name,
  };
}

export async function requireStaff() {
  const session = await getStaffSession();
  if (!session) {
    throw new Response(JSON.stringify({ error: "Sign in required" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  return session;
}

export async function requireOwner() {
  const session = await requireStaff();
  if (session.role !== "owner") {
    throw new Response(JSON.stringify({ error: "Owner access required" }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }
  return session;
}

export function validPin(pin: string) {
  return /^\d{4,8}$/.test(pin);
}

export function validStaffName(name: string) {
  return name.trim().length >= 1 && name.trim().length <= 40;
}

export function canAddAccount() {
  return listAccounts().length < MAX_ACCOUNTS;
}
