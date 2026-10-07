import { asError, json } from "@/lib/api";
import { requireStaff } from "@/lib/auth";
import { store } from "@/lib/db";
import { todayStr } from "@/lib/security";

export async function GET() {
  try {
    await requireStaff();
    const settings = store.settings();
    const log = store.dailyLog();
    const today = todayStr();
    const todayEntry = log.find((e) => e.date === today);
    const customers = store.customers();
    const low = store.stock().filter((s) => s.count <= s.reorder);
    const unread = store.enquiries().filter((e) => !e.read).length;
    const openOrders = store.orders().filter((order) => order.status === "new" || order.status === "ready").length;
    const weekStart = (() => {
      const d = new Date();
      const day = d.getDay();
      d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
      return d.toISOString().slice(0, 10);
    })();
    const week = log.filter((e) => e.date >= weekStart);
    return json({
      settings,
      todayCups: todayEntry?.cups || 0,
      todayRevenue: todayEntry?.revenue || 0,
      members: customers.length,
      lowStock: low,
      unread,
      openOrders,
      weekCups: week.reduce((a, e) => a + (e.cups || 0), 0),
      weekRevenue: week.reduce((a, e) => a + (e.revenue || 0), 0),
    });
  } catch (error) {
    return asError(error);
  }
}
