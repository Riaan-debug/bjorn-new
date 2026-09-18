import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Apostellō Coffee",
    template: "%s · Apostellō Coffee",
  },
  description: "not just served, Sent. Speciality coffee and smash burgers at Olympus | CMV Group, Pretoria.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "Apostellō Coffee",
    description: "not just served, Sent. Speciality coffee and smash burgers in Olympus, Pretoria.",
    locale: "en_ZA",
    type: "website",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-ZA" data-scroll-behavior="smooth" className={`${montserrat.variable} ${openSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-cream text-ink">{children}</body>
    </html>
  );
}
