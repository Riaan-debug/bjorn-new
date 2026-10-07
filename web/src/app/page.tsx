import Link from "next/link";
import { BeanDrift } from "@/components/site/BeanDrift";
import { CoolerLoop } from "@/components/site/CoolerLoop";
import { HeroFilm } from "@/components/site/HeroFilm";
import { SiteChrome } from "@/components/site/SiteChrome";
import { SiteImage } from "@/components/site/SiteImage";
import { publicMenu, publicSettings, publicSite } from "@/lib/db";
import { priceRange } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const settings = publicSettings();
  const featured = publicMenu().filter((item) => item.featured);
  const drinks = featured.filter((item) => item.kind === "drink").slice(0, 4);
  const food = featured.filter((item) => item.kind === "food").slice(0, 4);
  const site = publicSite();
  const photos = site.photos;
  const special = site.special;
  const host = settings.eventsContactName || "Joan";
  const specs = [
    ...settings.coffeeBlend.split("·").map((part) => part.trim()),
    ...settings.coffeeNotes.split(/\. (?=[A-Z])/).map((part) => part.trim().replace(/\.$/, "")),
  ].filter(Boolean);
  const shot = photos.homePour || drinks.find((item) => item.imagePath)?.imagePath || "";
  const smash =
    photos.homeSmash ||
    food.find((item) => /smash/i.test(item.name) && item.imagePath)?.imagePath ||
    food.find((item) => item.imagePath)?.imagePath ||
    "";
  const pour = photos.events || photos.homePour || special?.imagePath || shot;

  const promises = [
    { href: "/menu", title: "The shot", image: shot, label: "A shot" },
    { href: "/menu", title: "The smash", image: smash, label: "A smash burger" },
    { href: "/events", title: "A pour", image: pour, label: "A pour at an event" },
    { href: "/visit", title: "Olympus", image: photos.homeCounter, label: "Olympus" },
  ];

  const prints = [
    {
      href: "/visit",
      action: "Visit",
      sentence: "The counter at Olympus, while the day is on.",
      image: photos.homeCounter,
      label: "Olympus",
    },
    {
      href: "/menu",
      action: "The menu",
      sentence: "The smash, from the same pass as the coffee.",
      image: smash,
      label: "Smash burger",
    },
    {
      href: "/events",
      action: "Book us",
      sentence: "A pour, when the trailer comes to you.",
      image: pour,
      label: "A pour",
    },
  ];

  return (
    <SiteChrome darkHero>
      <section className="relative min-h-[92vh] overflow-hidden text-cream">
        <div className="absolute inset-0 hero-fallback" />
        <HeroFilm />
        <BeanDrift />
        <Link
          href="/menu"
          className="absolute bottom-10 left-1/2 z-30 -translate-x-1/2 bg-navy/85 px-8 py-3 text-[12px] uppercase tracking-[0.22em] text-cream"
        >
          Menu
        </Link>
      </section>

      <section className="bg-cream px-5 py-24 text-center sm:py-32">
        <p className="flex items-center justify-center gap-4 text-[11px] uppercase tracking-[0.28em] text-mist">
          <span className="h-px w-10 bg-navy/30" />
          Est. 26
          <span className="h-px w-10 bg-navy/30" />
        </p>
        <h1 className="mx-auto mt-6 max-w-4xl font-display text-4xl font-light leading-tight text-navy sm:text-6xl">
          {settings.slogan}
        </h1>
      </section>

      <section className="bean-rule-y">
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 py-12 sm:px-8 md:grid-cols-4">
          {promises.map((item) => (
            <li key={item.title}>
              <Link href={item.href} className="group block">
                <Frame src={item.image} label={item.title} ratio="aspect-square" />
                <p className="mt-3 text-center font-display text-lg font-light text-navy group-hover:underline">
                  {item.title}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,14rem)_1fr] lg:gap-16">
          <h2 className="font-display text-7xl font-light leading-none text-navy sm:text-8xl">Sent</h2>
          <p className="max-w-xl text-base leading-8 text-mist">
            Apostellō is the Greek for “to send”. The house blend is pulled, then handed over like it matters.
            There is also the smash.
          </p>
        </div>
        <div className="mt-12 grid items-center gap-8 lg:grid-cols-2">
          <ul className="flex flex-col gap-3">
            {specs.map((spec) => (
              <li key={spec} className="text-[13px] uppercase tracking-[0.16em] text-navy">
                {spec}
              </li>
            ))}
          </ul>
          <div className="aspect-video overflow-hidden rounded-md bg-navy">
            <CoolerLoop />
          </div>
        </div>
      </section>

      <section className="grid gap-10 px-5 pb-8 sm:px-8 md:grid-cols-3 md:gap-6 md:px-6">
        {prints.map((print) => (
          <article key={print.action} className="bg-cream">
            <Frame
              src={print.image}
              label={print.label}
              ratio="aspect-[4/5]"
              className="w-full rounded-md shadow-[0_12px_28px_rgba(1,27,61,0.08)]"
            />
            <p className="mt-5 font-display text-xl font-light leading-snug text-navy">{print.sentence}</p>
            <Link href={print.href} className="mt-3 inline-block text-[12px] uppercase tracking-[0.2em] text-navy underline underline-offset-4">
              {print.action}
            </Link>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        {special ? (
          <Link
            href="/menu"
            className="inline-flex items-center border border-navy px-5 py-3 text-[12px] uppercase tracking-[0.2em] text-navy"
          >
            Today · {special.name}
          </Link>
        ) : null}
        <div className={`grid gap-14 md:grid-cols-2 ${special ? "mt-12" : ""}`}>
          <NameColumn title="Drinks" items={drinks} />
          <NameColumn title="Food" items={food} />
        </div>
        <Link href="/menu" className="mt-12 inline-block text-[12px] uppercase tracking-[0.2em] text-navy underline underline-offset-4">
          Full menu
        </Link>
      </section>

      <section className="bean-rule-t px-5 py-24 text-center sm:px-8">
        <p className="mx-auto max-w-2xl font-display text-3xl font-light leading-snug text-navy sm:text-4xl">
          Come by {settings.location.split("|")[0].trim()}, or talk to{" "}
          <Link href="/events" className="underline underline-offset-4">
            {host}
          </Link>{" "}
          about an event.
        </p>
      </section>
    </SiteChrome>
  );
}

function Frame({
  src,
  label,
  ratio,
  className = "",
}: {
  src?: string;
  label: string;
  ratio: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div className={`flex items-end bg-navy p-6 ${ratio} ${className}`}>
        <span className="font-display text-3xl font-light text-cream">{label}</span>
      </div>
    );
  }
  return <SiteImage src={src} label={label} ratio={ratio} className={`w-full ${className}`} />;
}

function NameColumn({
  title,
  items,
}: {
  title: string;
  items: ReturnType<typeof publicMenu>;
}) {
  return (
    <div>
      <h3 className="text-[11px] uppercase tracking-[0.26em] text-mist">{title}</h3>
      <ul className="mt-6 space-y-5">
        {items.map((item) => (
          <li key={item.id} className="flex items-baseline gap-3">
            <span className="min-w-0 font-display text-2xl font-light leading-tight text-navy sm:text-3xl">{item.name}</span>
            <span className="mb-1 h-px min-w-6 flex-1 border-b border-dotted border-navy/35" />
            <span className="shrink-0 text-sm text-navy">{priceRange(item.sizes)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
