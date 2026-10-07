"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { bagCount } from "@/lib/bag";

export function BagLink({
  overlay,
  className = "",
  onClick,
}: {
  overlay?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const current = pathname === "/bag" || pathname.startsWith("/bag/");
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(bagCount());
    sync();
    window.addEventListener("ap-bag", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ap-bag", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

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
