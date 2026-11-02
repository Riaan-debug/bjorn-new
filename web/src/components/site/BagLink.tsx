"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { bagCount, hydrateBagFromServer } from "@/lib/bag";

export function BagLink({
  overlay,
  className = "",
  onClick,
  icon = false,
}: {
  overlay?: boolean;
  className?: string;
  onClick?: () => void;
  icon?: boolean;
}) {
  const pathname = usePathname();
  const current = pathname === "/bag" || pathname.startsWith("/bag/");
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(bagCount());
    sync();
    hydrateBagFromServer();
    window.addEventListener("ap-bag", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ap-bag", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const label = count ? `Bag, ${count}` : "Bag";

  if (icon) {
    return (
      <Link
        href="/bag"
        onClick={onClick}
        aria-current={current ? "page" : undefined}
        aria-label={label}
        title={label}
        className={`relative grid h-11 w-9 place-items-center ${overlay ? "text-cream" : "text-navy"} ${className}`}
      >
        <svg viewBox="0 0 32 40" className="h-8 w-6" fill="none" aria-hidden>
          <path
            d="M8 12h16l1.6 22.5c.1 1.4-1 2.5-2.4 2.5H8.8c-1.4 0-2.5-1.1-2.4-2.5L8 12Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M11 12c0-4 2.2-7 5-7s5 3 5 7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
        {count ? (
          <span className={`absolute -right-0.5 top-1 min-w-4 rounded-full px-1 text-center text-[10px] font-semibold leading-4 ${overlay ? "bg-cream text-navy" : "bg-navy text-cream"}`}>
            {count}
          </span>
        ) : null}
      </Link>
    );
  }

  return (
    <Link
      href="/bag"
      onClick={onClick}
      aria-current={current ? "page" : undefined}
      className={`${overlay ? "nav-link nav-link-dark" : "nav-link nav-link-light"}${current ? " nav-link-current" : ""} ${className}`}
    >
      Bag{count ? ` ${count}` : ""}
    </Link>
  );
}
