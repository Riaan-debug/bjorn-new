import type { MenuItem, Settings, StockItem } from "./types";

export const DEFAULT_SETTINGS: Settings = {
  businessName: "Apostellō Coffee",
  slogan: "not just served, Sent.",
  location: "Olympus | CMV Group",
  address: "17 Midas Avenue, Olympus, Pretoria, 0081",
  tradingHours: "Monday – Friday, 07:00 – 16:00",
  operatingDays: 5,
  dailyCupTarget: 100,
  loyaltyFreeAt: 10,
  instagramUrl: "https://www.instagram.com/apostellocafe/",
  whatsappUrl: "",
  googleBizUrl: "",
  publicPhone: "",
  publicEmail: "",
  eventsContactName: "Joan",
  eventsContactRole: "Office manager",
  eventsPhone: "0823160359",
  coffeeBlend: "60% Guatemala Hills · 40% Brazil Peaberry",
  coffeeNotes: "Pulled at 1:2.4, 28–32 seconds. Beans rest 10 days before service.",
  seeded: true,
};

export const MENU_SEED: MenuItem[] = [
  {
    id: "d1", name: "Espresso", kind: "drink", cat: "Espresso", active: true, featured: true,
    description: "Our house blend, pulled short and sweet.", imagePath: "",
    sizes: [{ sz: "S", label: "Single", price: 25 }, { sz: "M", label: "Double", price: 32 }],
  },
  {
    id: "d2", name: "Americano", kind: "drink", cat: "Espresso", active: true, featured: false,
    description: "Espresso stretched with hot water.", imagePath: "",
    sizes: [
      { sz: "S", label: "Small", price: 30 },
      { sz: "M", label: "Medium", price: 35 },
      { sz: "L", label: "Large", price: 40 },
    ],
  },
  {
    id: "d3", name: "Cappuccino", kind: "drink", cat: "Milk-based", active: true, featured: true,
    description: "Equal parts espresso, steamed milk and silk foam.", imagePath: "",
    sizes: [
      { sz: "S", label: "Small 8oz", price: 35 },
      { sz: "M", label: "Medium 12oz", price: 40 },
      { sz: "L", label: "Large 16oz", price: 46 },
    ],
  },
  {
    id: "d4", name: "Latte", kind: "drink", cat: "Milk-based", active: true, featured: true,
    description: "Longer, softer, still built on a proper shot.", imagePath: "",
    sizes: [
      { sz: "S", label: "Small 8oz", price: 36 },
      { sz: "M", label: "Medium 12oz", price: 42 },
      { sz: "L", label: "Large 16oz", price: 48 },
    ],
  },
  {
    id: "d5", name: "Flat White", kind: "drink", cat: "Milk-based", active: true, featured: false,
    description: "Velvet microfoam over a double shot.", imagePath: "",
    sizes: [{ sz: "M", label: "Standard", price: 38 }],
  },
  {
    id: "d6", name: "Mocha", kind: "drink", cat: "Speciality", active: true, featured: false,
    description: "Espresso, chocolate and steamed milk.", imagePath: "",
    sizes: [
      { sz: "S", label: "Small 8oz", price: 40 },
      { sz: "M", label: "Medium 12oz", price: 46 },
      { sz: "L", label: "Large 16oz", price: 52 },
    ],
  },
  {
    id: "d7", name: "Hot Chocolate", kind: "drink", cat: "Speciality", active: true, featured: false,
    description: "Rich cocoa, steamed milk, no espresso.", imagePath: "",
    sizes: [
      { sz: "S", label: "Small 8oz", price: 38 },
      { sz: "M", label: "Medium 12oz", price: 44 },
      { sz: "L", label: "Large 16oz", price: 50 },
    ],
  },
  {
    id: "d8", name: "Cold Brew", kind: "drink", cat: "Cold", active: true, featured: true,
    description: "Steeped slow, served over ice.", imagePath: "",
    sizes: [
      { sz: "M", label: "Regular", price: 45 },
      { sz: "L", label: "Large", price: 52 },
    ],
  },
  {
    id: "d9", name: "Iced Latte", kind: "drink", cat: "Cold", active: true, featured: false,
    description: "Espresso, cold milk, ice.", imagePath: "",
    sizes: [
      { sz: "M", label: "Regular", price: 44 },
      { sz: "L", label: "Large", price: 50 },
    ],
  },
  {
    id: "d10", name: "Strawberry Shake", kind: "drink", cat: "Shakes", active: true, featured: true,
    description: "As seen on the Apostellō cup — thick, cold, pink.", imagePath: "",
    sizes: [{ sz: "M", label: "Regular", price: 48 }],
  },
  {
    id: "d11", name: "Vanilla Shake", kind: "drink", cat: "Shakes", active: true, featured: false,
    description: "Creamy vanilla, built to travel.", imagePath: "",
    sizes: [{ sz: "M", label: "Regular", price: 46 }],
  },
  {
    id: "f1", name: "Classic Smash", kind: "food", cat: "Smash burgers", active: true, featured: true,
    description: "Single smash, American cheese, pickles, house sauce, toasted bun.", imagePath: "",
    sizes: [{ sz: "S", label: "Single", price: 89 }],
  },
  {
    id: "f2", name: "Double Smash", kind: "food", cat: "Smash burgers", active: true, featured: true,
    description: "Two thin patties, double cheese, pickle crunch.", imagePath: "",
    sizes: [{ sz: "M", label: "Double", price: 115 }],
  },
  {
    id: "f3", name: "The Sent", kind: "food", cat: "Smash burgers", active: true, featured: true,
    description: "Signature smash — cheddar, caramelised onion, Apostellō sauce.", imagePath: "",
    sizes: [{ sz: "M", label: "Signature", price: 119 }],
  },
  {
    id: "f4", name: "Bacon Smash", kind: "food", cat: "Smash burgers", active: true, featured: false,
    description: "Crisp bacon, cheese smash, sticky sauce.", imagePath: "",
    sizes: [{ sz: "M", label: "Bacon", price: 125 }],
  },
  {
    id: "f5", name: "Kids Smash", kind: "food", cat: "Smash burgers", active: true, featured: false,
    description: "Smaller patty, cheese, no heat. Comes with fries.", imagePath: "",
    sizes: [{ sz: "S", label: "Kids", price: 65 }],
  },
  {
    id: "f6", name: "Skinny Fries", kind: "food", cat: "Sides", active: true, featured: false,
    description: "Salted, crisp, ready for the burger.", imagePath: "",
    sizes: [{ sz: "M", label: "Portion", price: 35 }],
  },
  {
    id: "f7", name: "Loaded Fries", kind: "food", cat: "Sides", active: true, featured: false,
    description: "Cheese, smash sauce, spring onion.", imagePath: "",
    sizes: [{ sz: "M", label: "Portion", price: 68 }],
  },
  {
    id: "f8", name: "Butter Croissant", kind: "food", cat: "Bakery", active: true, featured: true,
    description: "Flaky, baked for the morning rush.", imagePath: "",
    sizes: [{ sz: "S", label: "Each", price: 32 }],
  },
  {
    id: "f9", name: "Banana Bread", kind: "food", cat: "Bakery", active: true, featured: false,
    description: "Thick slice, best with a flat white.", imagePath: "",
    sizes: [{ sz: "S", label: "Slice", price: 38 }],
  },
  {
    id: "f10", name: "Muffin of the day", kind: "food", cat: "Bakery", active: true, featured: false,
    description: "Ask the bar — it changes with the bake.", imagePath: "",
    sizes: [{ sz: "S", label: "Each", price: 34 }],
  },
  {
    id: "f11", name: "Spring Cookie", kind: "food", cat: "Bakery", active: true, featured: false,
    description: "House cookie — the one from the Instagram drop.", imagePath: "",
    sizes: [{ sz: "S", label: "Each", price: 22 }],
  },
];

export const STOCK_SEED: StockItem[] = [
  { id: "s1", name: "Coffee beans", cat: "Coffee", unit: "g", reorder: 200, count: 2000 },
  { id: "s2", name: "Full cream milk", cat: "Dairy", unit: "L", reorder: 4, count: 12 },
  { id: "s3", name: "Low fat milk", cat: "Dairy", unit: "L", reorder: 2, count: 6 },
  { id: "s4", name: "Oat milk", cat: "Dairy alt", unit: "L", reorder: 1, count: 3 },
  { id: "s5", name: "Chocolate powder", cat: "Dry goods", unit: "g", reorder: 50, count: 200 },
  { id: "s6", name: "Vanilla syrup", cat: "Syrups", unit: "ml", reorder: 100, count: 300 },
  { id: "s7", name: "Caramel syrup", cat: "Syrups", unit: "ml", reorder: 100, count: 300 },
  { id: "s8", name: "Smash patties", cat: "Food", unit: "each", reorder: 12, count: 40 },
  { id: "s9", name: "Burger buns", cat: "Food", unit: "each", reorder: 12, count: 36 },
  { id: "s10", name: "American cheese", cat: "Food", unit: "slices", reorder: 20, count: 80 },
  { id: "s11", name: "Bacon", cat: "Food", unit: "rashers", reorder: 10, count: 24 },
  { id: "s12", name: "Fries", cat: "Food", unit: "kg", reorder: 2, count: 6 },
  { id: "s13", name: "Croissants", cat: "Bakery", unit: "each", reorder: 4, count: 12 },
  { id: "s14", name: "Banana bread", cat: "Bakery", unit: "each", reorder: 2, count: 6 },
  { id: "s15", name: "Muffins", cat: "Bakery", unit: "each", reorder: 2, count: 8 },
  { id: "s16", name: "Cookies", cat: "Bakery", unit: "each", reorder: 6, count: 20 },
  { id: "s17", name: "Cups small 8oz", cat: "Packaging", unit: "each", reorder: 40, count: 120 },
  { id: "s18", name: "Cups medium 12oz", cat: "Packaging", unit: "each", reorder: 40, count: 120 },
  { id: "s19", name: "Cups large 16oz", cat: "Packaging", unit: "each", reorder: 30, count: 80 },
  { id: "s20", name: "Cup lids", cat: "Packaging", unit: "each", reorder: 60, count: 200 },
  { id: "s21", name: "Burger boxes", cat: "Packaging", unit: "each", reorder: 15, count: 50 },
  { id: "s22", name: "Gas LPG", cat: "Energy", unit: "cyl", reorder: 1, count: 2 },
];
