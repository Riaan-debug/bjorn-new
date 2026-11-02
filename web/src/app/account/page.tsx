import { AccountView } from "@/components/site/AccountView";
import { SiteChrome } from "@/components/site/SiteChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Your cup" };

export default function AccountPage() {
  return (
    <SiteChrome>
      <AccountView />
    </SiteChrome>
  );
}
