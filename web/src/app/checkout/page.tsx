import { CheckoutView } from "@/components/site/CheckoutView";
import { SiteChrome } from "@/components/site/SiteChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <SiteChrome>
      <CheckoutView />
    </SiteChrome>
  );
}
