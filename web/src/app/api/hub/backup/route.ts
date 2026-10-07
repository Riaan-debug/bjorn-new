import { asError, guardWrite, json, reject } from "@/lib/api";
import { requireOwner } from "@/lib/auth";
import { store } from "@/lib/db";
import { DEFAULT_SETTINGS } from "@/lib/seed";
import { todayStr, uid } from "@/lib/security";
import type { Customer, DailyEntry, Enquiry, MenuItem, MenuKind, OrderStatus, Settings, ShopOrder, ShopProduct, SiteContent, StockItem } from "@/lib/types";
import { mergeSite } from "@/lib/site";

const SETTINGS_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[];

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function cleanSettings(raw: unknown): Settings {
  const incoming = asRecord(raw) ?? {};
  const next: Settings = { ...DEFAULT_SETTINGS, ...store.settings(), seeded: true };
  for (const key of SETTINGS_KEYS) {
    if (key === "seeded") continue;
    if (incoming[key] === undefined) continue;
    const value = incoming[key];
    if (key === "operatingDays" || key === "dailyCupTarget" || key === "loyaltyFreeAt") {
      const n = Number(value);
      if (Number.isFinite(n)) next[key] = n;
      continue;
    }
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      (next[key] as string | number | boolean) = value as never;
    }
  }
  return next;
}

function cleanCustomers(raw: unknown): Customer[] {
  if (!Array.isArray(raw)) return store.customers();
  return raw.map((item) => {
    const row = asRecord(item) ?? {};
    return {
      id: String(row.id || uid()),
      name: String(row.name || "Guest"),
      phone: String(row.phone || ""),
      dateJoined: String(row.dateJoined || todayStr()),
      lastVisit: String(row.lastVisit || ""),
      visits: Number(row.visits || 0) || 0,
      stamps: Number(row.stamps || 0) || 0,
      freeCoffees: Number(row.freeCoffees || 0) || 0,
      notes: String(row.notes || ""),
    };
  });
}

function drinkOrFood(cat: string, kind: unknown): MenuKind {
  if (kind === "food" || kind === "drink") return kind;
  const food = /smash|burger|fries|bakery|cookie|croissant|muffin|bread/i.test(cat);
  return food ? "food" : "drink";
}

function cleanMenu(raw: unknown): MenuItem[] {
  if (!Array.isArray(raw)) return store.menuItems();
  return raw.map((item) => {
    const row = asRecord(item) ?? {};
    const cat = String(row.cat || "Other");
    const sizes = Array.isArray(row.sizes)
      ? row.sizes.map((size) => {
          const s = asRecord(size) ?? {};
          return {
            sz: String(s.sz || "M"),
            label: String(s.label || "Standard"),
            price: Number(s.price || 0) || 0,
          };
        })
      : [];
    return {
      id: String(row.id || uid()),
      name: String(row.name || "Item"),
      kind: drinkOrFood(cat, row.kind),
      cat,
      description: String(row.description || ""),
      active: row.active !== false,
      featured: Boolean(row.featured),
      imagePath: String(row.imagePath || ""),
      behindPath: String(row.behindPath || ""),
      sizes,
    };
  });
}

function cleanStock(raw: unknown): StockItem[] {
  if (!Array.isArray(raw)) return store.stock();
  return raw.map((item) => {
    const row = asRecord(item) ?? {};
    return {
      id: String(row.id || uid()),
      name: String(row.name || "Item"),
      cat: String(row.cat || "Other"),
      unit: String(row.unit || "each"),
      count: Number(row.count || 0) || 0,
      reorder: Number(row.reorder || 0) || 0,
    };
  });
}

function cleanDaily(raw: unknown): DailyEntry[] {
  if (!Array.isArray(raw)) return store.dailyLog();
  return raw.map((item) => {
    const row = asRecord(item) ?? {};
    return {
      id: String(row.id || uid()),
      date: String(row.date || todayStr()),
      cups: Number(row.cups || 0) || 0,
      revenue: Number(row.revenue || 0) || 0,
      notes: String(row.notes || ""),
    };
  });
}

function cleanShop(raw: unknown): ShopProduct[] {
  if (!Array.isArray(raw)) return store.shopProducts();
  return raw.map((item) => {
    const row = asRecord(item) ?? {};
    const sizes = Array.isArray(row.sizes)
      ? row.sizes.map((size) => {
          const s = asRecord(size) ?? {};
          return {
            id: String(s.id || uid()),
            label: String(s.label || "Bag"),
            grams: Number(s.grams || 0) || 0,
            price: Number(s.price || 0) || 0,
          };
        })
      : [];
    return {
      id: String(row.id || uid()),
      name: String(row.name || "Bag"),
      summary: String(row.summary || ""),
      active: row.active !== false,
      imagePath: String(row.imagePath || ""),
      behindPath: String(row.behindPath || ""),
      sizes,
    };
  });
}

function cleanOrders(raw: unknown): ShopOrder[] {
  if (!Array.isArray(raw)) return store.orders();
  const statuses: OrderStatus[] = ["new", "ready", "collected", "cancelled"];
  return raw.map((item) => {
    const row = asRecord(item) ?? {};
    const status = statuses.includes(row.status as OrderStatus) ? (row.status as OrderStatus) : "new";
    const items = Array.isArray(row.items)
      ? row.items.map((line) => {
          const s = asRecord(line) ?? {};
          return {
            productId: String(s.productId || ""),
            name: String(s.name || "Bag"),
            sizeId: String(s.sizeId || ""),
            sizeLabel: String(s.sizeLabel || ""),
            grams: Number(s.grams || 0) || 0,
            price: Number(s.price || 0) || 0,
            qty: Number(s.qty || 0) || 0,
          };
        })
      : [];
    return {
      id: String(row.id || uid()),
      number: String(row.number || ""),
      name: String(row.name || ""),
      email: String(row.email || ""),
      phone: String(row.phone || ""),
      collectDate: String(row.collectDate || ""),
      note: String(row.note || ""),
      createdAt: String(row.createdAt || new Date().toISOString()),
      status,
      items,
      total: Number(row.total || 0) || 0,
    };
  });
}

function cleanEnquiries(raw: unknown): Enquiry[] {
  if (!Array.isArray(raw)) return store.enquiries();
  return raw.map((item) => {
    const row = asRecord(item) ?? {};
    return {
      id: String(row.id || uid()),
      name: String(row.name || ""),
      email: String(row.email || ""),
      phone: String(row.phone || ""),
      message: String(row.message || ""),
      createdAt: String(row.createdAt || new Date().toISOString()),
      read: Boolean(row.read),
    };
  });
}

export async function GET() {
  try {
    await requireOwner();
    const settings = cleanSettings(store.settings());
    return json({
      exportedAt: new Date().toISOString(),
      settings,
      menuItems: store.menuItems(),
      customers: store.customers(),
      stock: store.stock(),
      dailyLog: store.dailyLog(),
      enquiries: store.enquiries(),
      shopProducts: store.shopProducts(),
      orders: store.orders(),
      site: store.site(),
    });
  } catch (error) {
    return asError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireOwner();
    const blocked = guardWrite(request, "hub-backup", 5, 60 * 1000);
    if (blocked) return blocked;
    const data = asRecord(await request.json());
    if (!data) return reject("Invalid backup file");

    if (Array.isArray(data.customers)) store.saveCustomers(cleanCustomers(data.customers));
    if (Array.isArray(data.stock)) store.saveStock(cleanStock(data.stock));
    if (Array.isArray(data.dailyLog)) store.saveDailyLog(cleanDaily(data.dailyLog));
    if (Array.isArray(data.menuItems)) store.saveMenuItems(cleanMenu(data.menuItems));
    if (Array.isArray(data.enquiries)) store.saveEnquiries(cleanEnquiries(data.enquiries));
    if (Array.isArray(data.shopProducts)) store.saveShopProducts(cleanShop(data.shopProducts));
    if (Array.isArray(data.orders)) store.saveOrders(cleanOrders(data.orders));
    if (asRecord(data.settings)) store.saveSettings(cleanSettings(data.settings));
    if (asRecord(data.site) || asRecord(data.special)) {
      const incoming = asRecord(data.site) ?? data;
      store.saveSite(mergeSite(incoming as Partial<SiteContent>));
    }

    return json({ ok: true });
  } catch (error) {
    return asError(error);
  }
}
