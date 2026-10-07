import { BagView } from "@/components/site/BagView";
import { SiteChrome } from "@/components/site/SiteChrome";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Bag" };

export default function BagPage() {
  return (
    <SiteChrome>
      <BagView />
    </SiteChrome>
  );
}
