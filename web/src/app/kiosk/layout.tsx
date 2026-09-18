import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Kiosk",
  appleWebApp: {
    capable: true,
    title: "Apostellō",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function KioskLayout({ children }: { children: React.ReactNode }) {
  return children;
}
