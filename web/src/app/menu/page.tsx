import { SiteChrome } from "@/components/site/SiteChrome";
import { publicMenu, publicSite } from "@/lib/db";
import { zar } from "@/lib/format";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Menu" };

function boardPrice(sizes: { label: string; price: number }[]) {
  if (!sizes.length) return "";
  if (sizes.length === 1) return zar(sizes[0].price);
  return sizes.map((s) => `${s.label} ${zar(s.price)}`).join(" · ");
}

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
        <p className="mt-4 max-w-xl text-base leading-8 text-mist">
          Speciality coffee and smash burgers.
        </p>

        <div className="mt-12 border border-navy bg-navy text-cream">
          <div className="grid md:grid-cols-2 md:divide-x md:divide-cream/20">
            <BoardColumn title="Drinks" items={drinks} />
            <div className="border-t border-cream/20 md:hidden" />
            <BoardColumn title="Food" items={food} showDescriptions />
          </div>
          {special ? (
            <div className="flex items-center gap-5 border-t border-cream/20 px-6 py-7 sm:px-10">
              {special.imagePath ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={special.imagePath} alt="" className="h-20 w-20 shrink-0 object-cover" />
              ) : null}
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-cream/50">Today</p>
                <p className="mt-1 font-display text-2xl font-light">{special.name}</p>
                {special.blurb ? <p className="mt-1 text-sm leading-6 text-cream/70">{special.blurb}</p> : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </SiteChrome>
  );
}

function BoardColumn({
  title,
  items,
  showDescriptions = false,
}: {
  title: string;
  items: ReturnType<typeof publicMenu>;
  showDescriptions?: boolean;
}) {
  const cats = [...new Set(items.map((i) => i.cat))];
  return (
    <section className="px-6 py-8 sm:px-10">
      <h2 className="text-center font-display text-2xl font-light">{title}</h2>
      {cats.map((cat) => (
        <div key={cat} className="mt-8">
          <h3 className="text-[11px] uppercase tracking-[0.26em] text-cream/45">{cat}</h3>
          <ul className="mt-4 space-y-3.5">
            {items
              .filter((item) => item.cat === cat)
              .map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  {item.imagePath ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imagePath} alt="" className="mt-0.5 h-14 w-14 shrink-0 object-cover" />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-display text-[1.05rem] font-light leading-snug">{item.name}</span>
                      {item.sizes.length === 1 ? (
                        <span className="shrink-0 text-[13px] text-cream/75">{zar(item.sizes[0].price)}</span>
                      ) : null}
                    </div>
                    {showDescriptions && item.description ? (
                      <p className="mt-1 text-[13px] leading-5 text-cream/60">{item.description}</p>
                    ) : null}
                    {item.sizes.length > 1 ? (
                      <p className="mt-1 text-[12px] leading-5 text-cream/55">{boardPrice(item.sizes)}</p>
                    ) : null}
                  </div>
                </li>
              ))}
          </ul>
        </div>
      ))}
      {!items.length ? <p className="mt-8 text-center text-sm text-cream/50">Nothing on yet.</p> : null}
    </section>
  );
}
