import { cleanBag } from "./bag";
import { store } from "./db";
import { digits } from "./security";
import type { Customer } from "./types";

export function phonesMatch(a: string, b: string) {
  const x = digits(a);
  const y = digits(b);
  if (!x || !y) return false;
  return x === y || x.endsWith(y) || y.endsWith(x);
}

export function findCustomerByPhone(phone: string) {
  return store.customers().find((customer) => phonesMatch(customer.phone, phone));
}

export function saveCustomer(next: Customer) {
  const list = store.customers();
  const index = list.findIndex((customer) => customer.id === next.id);
  if (index >= 0) list[index] = next;
  else list.unshift(next);
  store.saveCustomers(list);
}

export function staffCustomer(customer: Customer) {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    dateJoined: customer.dateJoined,
    lastVisit: customer.lastVisit,
    visits: customer.visits,
    stamps: customer.stamps,
    freeCoffees: customer.freeCoffees,
    notes: customer.notes,
    email: customer.email || "",
    hasPin: Boolean(customer.pinHash),
  };
}

export function cardPayload(customer: Customer) {
  const settings = store.settings();
  const orders = store
    .orders()
    .filter((order) => order.customerId === customer.id || phonesMatch(order.phone, customer.phone))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 20)
    .map((order) => ({
      id: order.id,
      number: order.number,
      status: order.status,
      collectDate: order.collectDate,
      total: order.total,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        name: item.name,
        sizeLabel: item.sizeLabel,
        qty: item.qty,
      })),
    }));
  return {
    name: customer.name,
    phone: customer.phone,
    email: customer.email || "",
    dateJoined: customer.dateJoined || "",
    stamps: customer.stamps,
    visits: customer.visits,
    freeCoffees: customer.freeCoffees,
    lastVisit: customer.lastVisit,
    loyaltyFreeAt: settings.loyaltyFreeAt || 10,
    bag: cleanBag(customer.bag),
    orders,
  };
}
