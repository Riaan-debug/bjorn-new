import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import path from "path";
import type { Customer, DailyEntry, Enquiry, MenuItem, Settings, SiteContent, StaffRole, StockItem } from "./types";
import { DEFAULT_SETTINGS, MENU_SEED, STOCK_SEED } from "./seed";
import { DEFAULT_SITE, mergeSite } from "./site";

type StoreKey = "settings" | "menuItems" | "customers" | "stock" | "dailyLog" | "enquiries" | "auth" | "site";

export type AuthAccount = {
  id: string;
  name: string;
  role: StaffRole;
  pinHash: string;
};

type AuthRow = {
  pinHash?: string;
  accounts?: AuthAccount[];
};

let instance: Database.Database | null = null;

function dbPath() {
  if (process.env.DATABASE_PATH) return process.env.DATABASE_PATH;
  return path.join(process.cwd(), "data", "apostello.db");
}

export function getDb() {
  if (instance) return instance;
  const file = dbPath();
  mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS store (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  seedIfNeeded(db);
  instance = db;
  return db;
}

function read<T>(db: Database.Database, key: StoreKey, fallback: T): T {
  const row = db.prepare("SELECT value FROM store WHERE key = ?").get(key) as { value: string } | undefined;
  if (!row) return fallback;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return fallback;
  }
}

function write<T>(db: Database.Database, key: StoreKey, value: T) {
  db.prepare(`
    INSERT INTO store (key, value, updated_at)
    VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(key, JSON.stringify(value));
}

function seedIfNeeded(db: Database.Database) {
  const settings = read<Settings>(db, "settings", { ...DEFAULT_SETTINGS, seeded: false });
  if (settings.seeded) return;
  write(db, "settings", DEFAULT_SETTINGS);
  write(db, "menuItems", MENU_SEED);
  write(db, "stock", STOCK_SEED);
  write(db, "customers", []);
  write(db, "dailyLog", []);
  write(db, "enquiries", []);
  write(db, "auth", { pinHash: "" });
  write(db, "site", DEFAULT_SITE);
}

export const store = {
  settings(): Settings {
    return { ...DEFAULT_SETTINGS, ...read(getDb(), "settings", DEFAULT_SETTINGS) };
  },
  saveSettings(value: Settings) {
    write(getDb(), "settings", value);
  },
  menuItems(): MenuItem[] {
    return read(getDb(), "menuItems", MENU_SEED);
  },
  saveMenuItems(value: MenuItem[]) {
    write(getDb(), "menuItems", value);
  },
  customers(): Customer[] {
    return read(getDb(), "customers", []);
  },
  saveCustomers(value: Customer[]) {
    write(getDb(), "customers", value);
  },
  stock(): StockItem[] {
    return read(getDb(), "stock", STOCK_SEED);
  },
  saveStock(value: StockItem[]) {
    write(getDb(), "stock", value);
  },
  dailyLog(): DailyEntry[] {
    return read(getDb(), "dailyLog", []);
  },
  saveDailyLog(value: DailyEntry[]) {
    write(getDb(), "dailyLog", value);
  },
  enquiries(): Enquiry[] {
    return read(getDb(), "enquiries", []);
  },
  saveEnquiries(value: Enquiry[]) {
    write(getDb(), "enquiries", value);
  },
  auth(): AuthRow {
    return read(getDb(), "auth", { pinHash: "" });
  },
  saveAuth(value: AuthRow) {
    write(getDb(), "auth", value);
  },
  site(): SiteContent {
    return mergeSite(read(getDb(), "site", DEFAULT_SITE));
  },
  saveSite(value: SiteContent) {
    write(getDb(), "site", mergeSite(value));
  },
};

export function publicSettings() {
  const s = store.settings();
  return {
    businessName: s.businessName,
    slogan: s.slogan,
    location: s.location,
    address: s.address,
    tradingHours: s.tradingHours,
    instagramUrl: s.instagramUrl,
    whatsappUrl: s.whatsappUrl,
    googleBizUrl: s.googleBizUrl,
    googleReviewUrl: s.googleReviewUrl,
    publicPhone: s.publicPhone,
    publicEmail: s.publicEmail,
    eventsContactName: s.eventsContactName,
    eventsContactRole: s.eventsContactRole,
    eventsPhone: s.eventsPhone,
    coffeeBlend: s.coffeeBlend,
    coffeeNotes: s.coffeeNotes,
    loyaltyFreeAt: s.loyaltyFreeAt,
  };
}

export function publicMenu() {
  return store
    .menuItems()
    .filter((item) => item.active)
    .map(({ id, name, kind, cat, description, featured, imagePath, sizes }) => ({
      id,
      name,
      kind,
      cat,
      description,
      featured,
      imagePath,
      sizes,
    }));
}

export function publicSite() {
  const site = store.site();
  const special = site.special.active && (site.special.name || site.special.blurb || site.special.imagePath)
    ? {
        name: site.special.name || "Today",
        blurb: site.special.blurb,
        imagePath: site.special.imagePath,
      }
    : null;
  return {
    special,
    photos: site.photos,
    team: site.team.filter((person) => person.name),
    reviews: site.reviews.filter((review) => review.quote),
  };
}
