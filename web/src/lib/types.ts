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
  behindPath?: string;
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

export type BagSize = {
  id: string;
  label: string;
  grams: number;
  price: number;
};

export type ShopProduct = {
  id: string;
  name: string;
  summary: string;
  active: boolean;
  imagePath: string;
  behindPath?: string;
  sizes: BagSize[];
};

export type OrderStatus = "new" | "ready" | "collected" | "cancelled";

export type OrderLine = {
  productId: string;
  name: string;
  sizeId: string;
  sizeLabel: string;
  grams: number;
  price: number;
  qty: number;
};

export type ShopOrder = {
  id: string;
  number: string;
  name: string;
  email: string;
  phone: string;
  collectDate: string;
  note: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderLine[];
  total: number;
};

export type EnquiryKind = "message" | "event";

export type EnquiryEvent = {
  date: string;
  guests: number;
  power: boolean;
  trailerAccess: boolean;
};

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  read: boolean;
  kind?: EnquiryKind;
  event?: EnquiryEvent;
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

export type TeamPerson = {
  id: string;
  name: string;
  role: string;
  imagePath: string;
};

export type SiteReview = {
  id: string;
  quote: string;
  name: string;
};

export type SiteContent = {
  special: SiteSpecial;
  photos: Record<string, string>;
  team: TeamPerson[];
  reviews: SiteReview[];
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
  googleReviewUrl: string;
  publicPhone: string;
  publicEmail: string;
  eventsContactName: string;
  eventsContactRole: string;
  eventsPhone: string;
  coffeeBlend: string;
  coffeeNotes: string;
  seeded: boolean;
};
