import { SiteChrome } from "@/components/site/SiteChrome";
import { MediaPlaceholder } from "@/components/site/MediaPlaceholder";
import { publicMenu, publicSite } from "@/lib/db";
import { zar } from "@/lib/format";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Menu" };

export default function MenuPage() {
  const items = publicMenu();
  const drinks = items.filter((i) => i.kind === "drink");
  const food = items.filter((i) => i.kind === "food");
  const special = publicSite().special;

  return (
    <SiteChrome>
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-mist">Olympus · CMV Group</p>
        <h1 className="mt-3 font-display text-5xl font-light text-navy">Menu</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-mist">
          Speciality coffee and smash burgers. Photos will land in these frames as they come in.
        </p>
        {special ? (
          <div className="mt-10 flex max-w-2xl items-center gap-4 border border-navy bg-white p-4">
            {special.imagePath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={special.imagePath} alt="" className="h-20 w-20 shrink-0 object-cover" />
            ) : null}
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-mist">Today</p>
              <p className="mt-1 font-display text-2xl font-light text-navy">{special.name}</p>
              {special.blurb ? <p className="mt-1 text-sm leading-6 text-mist">{special.blurb}</p> : null}
            </div>
          </div>
        ) : null}

        <Section title="Drinks" items={drinks} />
        <Section title="Food" items={food} />
      </div>
    </SiteChrome>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: ReturnType<typeof publicMenu>;
}) {
  const cats = [...new Set(items.map((i) => i.cat))];
  return (
    <section className="mt-16">
      <h2 className="font-display text-3xl font-light text-navy">{title}</h2>
      {cats.map((cat) => (
        <div key={cat} className="mt-10">
          <h3 className="text-[11px] uppercase tracking-[0.26em] text-mist">{cat}</h3>
          <div className="mt-5 divide-y divide-line border-y border-line">
            {items.filter((i) => i.cat === cat).map((item) => (
              <article key={item.id} className="grid gap-6 py-7 md:grid-cols-[160px_1fr]">
                {item.imagePath ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imagePath} alt={item.name} className="h-36 w-full object-cover" />
                ) : (
                  <MediaPlaceholder label={`${item.name} photo`} ratio="aspect-[4/3] h-36" />
                )}
                <div className="flex flex-col justify-center">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h4 className="font-display text-2xl font-light text-navy">{item.name}</h4>
                    <p className="text-sm text-navy">
                      {item.sizes.map((s) => `${s.label} ${zar(s.price)}`).join(" · ")}
                    </p>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-mist">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
