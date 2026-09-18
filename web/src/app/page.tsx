import Link from "next/link";
import { SiteChrome } from "@/components/site/SiteChrome";
import { SiteImage } from "@/components/site/SiteImage";
import { Wordmark } from "@/components/site/Wordmark";
import { publicMenu, publicSettings, publicSite } from "@/lib/db";
import { priceRange } from "@/lib/format";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const settings = publicSettings();
  const featured = publicMenu().filter((item) => item.featured).slice(0, 6);
  const site = publicSite();
  const photos = site.photos;
  const special = site.special;

  return (
    <SiteChrome darkHero>
      <section className="relative min-h-[92vh] overflow-hidden text-cream">
        <div className="absolute inset-0 hero-fallback" />
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-50"
          autoPlay
          muted
          loop
          playsInline
          poster="/media/hero-poster.jpg"
        >
          <source src="/media/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-navy/40 via-navy/35 to-navy" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-end px-5 pb-20 pt-32 sm:px-8">
          <p className="mb-6 text-[12px] font-medium uppercase tracking-[0.22em] text-white">
            Speciality coffee · Smash burgers · Est. 26
          </p>
          <Wordmark invert size="lg" />
          <p className="mt-8 max-w-xl font-display text-[1.65rem] font-light leading-snug tracking-[0.02em] text-white sm:text-4xl">
            {settings.slogan}
          </p>
          <p className="mt-5 text-[15px] leading-7 tracking-[0.01em] text-white sm:text-lg">
            {settings.location}
          </p>
          <p className="mt-1 text-[15px] leading-7 tracking-[0.01em] text-white sm:text-lg">
            {settings.tradingHours}
          </p>
          {special ? (
            <div className="mt-8 flex max-w-xl items-center gap-4 border border-cream/25 bg-navy/50 p-4 backdrop-blur-sm">
              {special.imagePath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={special.imagePath} alt="" className="h-20 w-20 shrink-0 object-cover" />
              ) : null}
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-cream/60">Today</p>
                <p className="mt-1 font-display text-xl font-light text-white">{special.name}</p>
                {special.blurb ? <p className="mt-1 text-sm leading-6 text-cream/75">{special.blurb}</p> : null}
              </div>
            </div>
          ) : null}
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/menu" className="btn-cream px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.16em]">
              View menu
            </Link>
            <Link href="/visit" className="btn-ghost px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.16em]">
              Find us
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-24 sm:px-8 md:grid-cols-2 md:items-center">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-mist">The cup</p>
          <h2 className="mt-3 font-display text-4xl font-light text-navy">Sent, not just served.</h2>
          <p className="mt-5 max-w-md text-base leading-8 text-mist">
            Apostellō is the Greek for “to send”. Every shot is a Guatemala Hills and Brazil Peaberry blend,
            pulled at 1:2.4 for 28–32 seconds, then handed over like it matters.
          </p>
          <p className="mt-4 text-sm text-navy">{settings.coffeeBlend}</p>
          <Link href="/about" className="mt-8 inline-block text-[12px] uppercase tracking-[0.22em] text-navy underline underline-offset-4">
            The story
          </Link>
        </div>
        <SiteImage src={photos.homeStory} label="Café / trailer still" className="min-h-[360px]" />
      </section>

      <section className="bg-navy text-cream">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-cream/50">From the counter</p>
              <h2 className="mt-3 font-display text-4xl font-light">Coffee and smash.</h2>
            </div>
            <Link href="/menu" className="hidden text-[12px] uppercase tracking-[0.22em] text-cream/70 md:inline">
              Full menu
            </Link>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item) => (
              <article key={item.id} className="border border-cream/10 p-6">
                <p className="text-[11px] uppercase tracking-[0.2em] text-cream/45">{item.cat}</p>
                <h3 className="mt-3 font-display text-2xl font-light">{item.name}</h3>
                <p className="mt-3 text-sm leading-6 text-cream/65">{item.description}</p>
                <p className="mt-6 text-sm text-cream">{priceRange(item.sizes)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-24 sm:px-8 md:grid-cols-3">
        <SiteImage src={photos.homeSmash} label="Smash burger still" />
        <SiteImage src={photos.homePour} label="Espresso / pour" />
        <SiteImage src={photos.homeCounter} label="Olympus counter" />
      </section>
    </SiteChrome>
  );
}
