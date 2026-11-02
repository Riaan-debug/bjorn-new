import Link from "next/link";
import { Collage } from "@/components/site/Collage";
import { HeroFilm } from "@/components/site/HeroFilm";
import { SentMoment } from "@/components/site/SentMoment";
import { SiteChrome } from "@/components/site/SiteChrome";
import { SiteImage } from "@/components/site/SiteImage";
import { WordSticker } from "@/components/site/Stickers";
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
  const three = [
    { href: "/beans", title: "Coffee", line: "Bags of the house blend, to take home.", image: shot, label: "The cup", word: "Sent", shift: -36 },
    { href: "/menu", title: "Smash", line: "The smash, from the same pass as the coffee.", image: smash, label: "A smash burger", word: "Smash", shift: -48 },
    { href: "/visit", title: "Olympus", line: "17 Midas Avenue. Weekdays, from seven.", image: photos.homeCounter, label: "The counter", word: "Est. 26", shift: -28 },
  ];

  const collage = [
    { src: photos.homeStory, label: "The trailer" },
    { src: photos.events, label: "A pour at the trailer" },
    { src: photos.galleryInterior, label: "The machine" },
    { src: photos.galleryCounter, label: "The trailer counter" },
    { src: photos.homeSmash, label: "The smash" },
    { src: photos.homePour, label: "The cup" },
    { src: photos.galleryShake, label: "Strawberry shake" },
  ];

  return (
    <SiteChrome darkHero>
      <section className="relative min-h-[92vh] overflow-hidden text-cream">
        <div className="absolute inset-0 hero-fallback" />
        <HeroFilm />
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

      <section className="grid gap-10 px-3 pb-8 sm:px-5 md:grid-cols-3 md:gap-6">
        {three.map((item) => (
          <article key={item.title} className="relative pt-12">
            <WordSticker word={item.word} shift={item.shift} className="left-1/2 top-2 -translate-x-1/2" />
            <Link href={item.href} className="group block">
              <Frame src={item.image} label={item.label} ratio="aspect-[4/5]" className="w-full" />
              <h2 className="mt-5 text-center font-display text-lg font-bold uppercase tracking-[0.08em] text-navy group-hover:underline">
                {item.title}
              </h2>
              <p className="mt-1 text-center text-sm text-mist">{item.line}</p>
            </Link>
          </article>
        ))}
      </section>

      <SentMoment
        src={shot}
        specs={specs}
        copy='Apostellō is the Greek for “to send”. The house blend is pulled, then handed over like it matters. There is also the smash.'
      />

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

      <section className="px-3 pb-6 sm:px-5">
        <Collage items={collage} />
        <Link href="/gallery" className="mt-5 inline-block text-[12px] uppercase tracking-[0.2em] text-navy underline underline-offset-4">
          Gallery
        </Link>
      </section>

      <section className="bean-rule-t px-5 py-24 text-center sm:px-8">
        <p className="mx-auto max-w-2xl font-display text-3xl font-light leading-snug text-navy sm:text-4xl">
          <Link href="/visit#write" className="underline underline-offset-4">
            Contact us
          </Link>
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
