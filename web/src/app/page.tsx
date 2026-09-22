import Link from "next/link";
import { BeanDrift } from "@/components/site/BeanDrift";
import { HeroFilm } from "@/components/site/HeroFilm";
import { SiteChrome } from "@/components/site/SiteChrome";
import { SiteImage } from "@/components/site/SiteImage";
import { publicMenu, publicSettings, publicSite } from "@/lib/db";
import { priceRange } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const settings = publicSettings();
  const featured = publicMenu().filter((item) => item.featured);
  const drinks = featured.filter((item) => item.kind === "drink").slice(0, 5);
  const food = featured.filter((item) => item.kind === "food").slice(0, 5);
  const site = publicSite();
  const photos = site.photos;
  const special = site.special;

  return (
    <SiteChrome darkHero>
      <section className="relative min-h-[92vh] overflow-hidden text-cream">
        <div className="absolute inset-0 hero-fallback" />
        <HeroFilm location={settings.location} tradingHours={settings.tradingHours} />
        <BeanDrift />
      </section>

      <section className="border-b border-line bg-cream">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-8 sm:px-8 sm:py-10">
          <p className="max-w-3xl flex-1 font-display text-3xl font-light leading-snug text-navy sm:text-5xl">
            {settings.slogan}
          </p>
          <div className="bean-stage relative h-20 w-24 shrink-0 sm:h-28 sm:w-36">
            <BeanDrift preset="slogan" tone="navy" />
          </div>
        </div>
      </section>

      <SiteImage src={photos.homeStory} label="Café / trailer still" ratio="aspect-[16/9]" className="min-h-[420px] w-full" drift="stillWide" />

      {special ? (
        <section className="border-b border-line">
          <div className="mx-auto flex max-w-6xl items-center gap-5 px-5 py-10 sm:px-8">
            {special.imagePath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={special.imagePath} alt="" className="h-24 w-24 shrink-0 object-cover" />
            ) : null}
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-mist">Today</p>
              <p className="mt-2 font-display text-3xl font-light text-navy">{special.name}</p>
              {special.blurb ? <p className="mt-2 max-w-xl text-sm leading-7 text-mist">{special.blurb}</p> : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto grid max-w-6xl items-center gap-6 px-5 py-16 sm:px-8 md:grid-cols-[minmax(0,36rem)_1fr] md:gap-10">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-mist">The cup</p>
          <h2 className="mt-3 max-w-xl font-display text-4xl font-light text-navy">Sent, not just served.</h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-mist">
            Apostellō is the Greek for “to send”. Every shot is a Guatemala Hills and Brazil Peaberry blend,
            pulled at 1:2.4 for 28–32 seconds, then handed over like it matters.
          </p>
          <p className="mt-4 text-sm text-navy">{settings.coffeeBlend}</p>
          <Link href="/about" className="mt-8 inline-block text-[12px] uppercase tracking-[0.22em] text-navy underline underline-offset-4">
            The story
          </Link>
        </div>
        <div className="bean-stage relative h-36 md:h-72">
          <BeanDrift preset="story" tone="navy" />
        </div>
      </section>

      <section className="grid gap-3 px-5 sm:px-8 md:grid-cols-3 md:px-0">
        <SiteImage src={photos.homeSmash} label="Smash burger still" className="min-h-[320px]" drift="stillSmash" />
        <SiteImage src={photos.homePour} label="Espresso / pour" className="min-h-[320px]" drift="stillPour" />
        <SiteImage src={photos.homeCounter} label="Olympus counter" className="min-h-[320px]" drift="stillCounter" />
      </section>

      <section className="relative overflow-hidden bg-navy text-cream">
        <BeanDrift preset="gutter" tone="cream" className="hidden xl:block" />
        <div className="relative z-10 mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-cream/50">From the counter</p>
              <h2 className="mt-3 font-display text-4xl font-light">Coffee and smash.</h2>
            </div>
            <Link href="/menu" className="hidden text-[12px] uppercase tracking-[0.22em] text-cream/70 md:inline">
              Full menu
            </Link>
          </div>
          <div className="mt-10 grid gap-12 border-t border-cream/15 pt-10 md:grid-cols-2 md:divide-x md:divide-cream/15">
            <HomeColumn title="Drinks" items={drinks} className="md:pr-12" />
            <HomeColumn title="Food" items={food} className="md:pl-12" />
          </div>
          <div className="bean-stage relative mt-12 h-28 md:mt-14">
            <BeanDrift preset="counter" tone="cream" />
          </div>
          <Link href="/menu" className="mt-6 inline-block text-[12px] uppercase tracking-[0.22em] text-cream/70 md:hidden">
            Full menu
          </Link>
        </div>
      </section>
    </SiteChrome>
  );
}

function HomeColumn({
  title,
  items,
  className = "",
}: {
  title: string;
  items: ReturnType<typeof publicMenu>;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="text-[11px] uppercase tracking-[0.26em] text-cream/45">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-baseline justify-between gap-4">
            <span className="font-display text-xl font-light">{item.name}</span>
            <span className="shrink-0 text-sm text-cream/70">{priceRange(item.sizes)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
