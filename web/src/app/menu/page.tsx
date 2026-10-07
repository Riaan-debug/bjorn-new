import { BagShot } from "@/components/site/BagShot";
import { SiteChrome } from "@/components/site/SiteChrome";
import { publicMenu, publicSite } from "@/lib/db";
import { priceRange, zar } from "@/lib/format";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Menu" };

function boardPrice(sizes: { label: string; price: number }[]) {
  if (sizes.length <= 1) return "";
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
        <p className="text-center text-[11px] uppercase tracking-[0.28em] text-mist">Olympus · CMV Group</p>
        <h1 className="mt-3 text-center font-display text-5xl font-light text-navy">Menu</h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-base leading-8 text-mist">
          Speciality coffee and smash burgers.
        </p>

        {special ? (
          <div className="mx-auto mt-12 flex max-w-xl items-center gap-5 border border-navy px-5 py-4">
            {special.imagePath ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={special.imagePath} alt="" className="h-16 w-16 shrink-0 object-cover" />
            ) : null}
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-mist">Today</p>
              <p className="mt-1 font-display text-2xl font-light text-navy">{special.name}</p>
              {special.blurb ? <p className="mt-1 text-sm leading-6 text-mist">{special.blurb}</p> : null}
            </div>
          </div>
        ) : null}

        <div className="mt-16 grid gap-16 md:grid-cols-2 md:gap-12">
          <BoardColumn title="Drinks" items={drinks} />
          <BoardColumn title="Food" items={food} />
        </div>
      </div>
    </SiteChrome>
  );
}

function BoardColumn({
  title,
  items,
}: {
  title: string;
  items: ReturnType<typeof publicMenu>;
}) {
  const cats = [...new Set(items.map((i) => i.cat))];
  return (
    <section>
      <h2 className="font-display text-3xl font-light text-navy">{title}</h2>
      {cats.map((cat) => (
        <div key={cat} className="mt-10">
          <h3 className="text-[11px] uppercase tracking-[0.26em] text-mist">{cat}</h3>
          <ul className="mt-6 space-y-10">
            {items
              .filter((item) => item.cat === cat)
              .map((item) => (
                <li key={item.id}>
                  {item.imagePath ? (
                    <BagShot front={item.imagePath} behind={item.behindPath || ""} name={item.name} className="mb-4" />
                  ) : null}
                  <div className="flex items-baseline gap-3">
                    <span className="min-w-0 font-display text-2xl font-light leading-snug text-navy">{item.name}</span>
                    <span className="mb-1 h-px min-w-4 flex-1 border-b border-dotted border-navy/35" />
                    <span className="shrink-0 text-sm text-navy">{priceRange(item.sizes)}</span>
                  </div>
                  {item.description ? <p className="mt-2 text-sm leading-6 text-mist">{item.description}</p> : null}
                  {item.sizes.length > 1 ? (
                    <p className="mt-1 text-[12px] leading-5 text-mist">{boardPrice(item.sizes)}</p>
                  ) : null}
                </li>
              ))}
          </ul>
        </div>
      ))}
      {!items.length ? <p className="mt-8 text-sm text-mist">Nothing on yet.</p> : null}
    </section>
  );
}
