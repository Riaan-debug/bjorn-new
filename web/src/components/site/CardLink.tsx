"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileCup, cupFirstName } from "./Stickers";

type CupState = {
  name: string;
  signedIn: boolean;
  freeDue: boolean;
};

export function CardLink({
  overlay,
  className = "",
  onClick,
}: {
  overlay?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const current = pathname === "/account" || pathname.startsWith("/account/");
  const [card, setCard] = useState<CupState>({ name: "", signedIn: false, freeDue: false });

  useEffect(() => {
    const sync = () => {
      fetch("/api/account/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const need = Number(data?.loyaltyFreeAt) || 10;
          const stamps = Number(data?.stamps) || 0;
          setCard({
            name: cupFirstName(String(data?.name || "")),
            signedIn: Boolean(data?.name),
            freeDue: stamps > 0 && stamps % need === 0,
          });
        })
        .catch(() => setCard({ name: "", signedIn: false, freeDue: false }));
    };
    sync();
    window.addEventListener("ap-card", sync);
    return () => window.removeEventListener("ap-card", sync);
  }, []);

  const label = card.signedIn ? `${card.name}'s cup` : "Your cup";

  return (
    <Link
      href="/account"
      onClick={onClick}
      aria-current={current ? "page" : undefined}
      aria-label={label}
      title={label}
      className={`profile-cup ${overlay ? "profile-cup-dark" : "profile-cup-light"}${current ? " profile-cup-current" : ""} ${className}`}
    >
      <ProfileCup invert={overlay} filled={card.signedIn} className="h-11 w-9" />
      {card.name ? (
        <span className={`profile-cup-name${card.name.length > 6 ? " profile-cup-name-long" : ""}`}>
          {card.name}
        </span>
      ) : null}
      {card.freeDue ? <span className="profile-cup-dot" /> : null}
    </Link>
  );
}
