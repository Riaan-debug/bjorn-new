export type MenuKind = "drink" | "food";

export type MenuSize = {
  sz: string;
  label: string;
  price: number;
};

export type MenuItem = {
  id: string;
  name: string;
  kind: MenuKind;
  cat: string;
  description: string;
  active: boolean;
  featured: boolean;
  imagePath: string;
  sizes: MenuSize[];
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  dateJoined: string;
  lastVisit: string;
  visits: number;
  stamps: number;
  freeCoffees: number;
  notes: string;
};

export type StockItem = {
  id: string;
  name: string;
  cat: string;
  unit: string;
  count: number;
  reorder: number;
};

export type DailyEntry = {
  id: string;
  date: string;
  cups: number;
  revenue: number;
  notes: string;
};

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export type StaffRole = "owner" | "staff";

export type StaffMember = {
  id: string;
  name: string;
  role: StaffRole;
};

export type SiteSpecial = {
  active: boolean;
  name: string;
  blurb: string;
  imagePath: string;
};

export type SiteContent = {
  special: SiteSpecial;
  photos: Record<string, string>;
};

export type Settings = {
  businessName: string;
  slogan: string;
  location: string;
  address: string;
  tradingHours: string;
  operatingDays: number;
  dailyCupTarget: number;
  loyaltyFreeAt: number;
  instagramUrl: string;
  whatsappUrl: string;
  googleBizUrl: string;
  publicPhone: string;
  publicEmail: string;
  coffeeBlend: string;
  coffeeNotes: string;
  seeded: boolean;
};
