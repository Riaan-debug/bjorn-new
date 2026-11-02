import { SiteChrome } from "@/components/site/SiteChrome";
import { publicMenu, publicSite } from "@/lib/db";
import { zar } from "@/lib/format";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Menu" };

export default function MenuPage() {
  const site = publicSite();
  const special = site.special;
  const boards = [site.photos.menuBoard, site.photos.menuBoardFood].filter(Boolean);

  return (
    <SiteChrome>
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <p className="text-center text-[11px] uppercase tracking-[0.28em] text-mist">Olympus · CMV Group</p>
        <h1 className="mt-3 text-center font-display text-5xl font-bold uppercase tracking-tight text-navy sm:text-7xl">Menu</h1>

        {special ? (
          <p className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-3 text-center text-sm text-navy">
            <span className="text-[11px] uppercase tracking-[0.22em] text-mist">Today</span>
            <span className="font-display text-lg font-semibold">{special.name}</span>
            {special.blurb ? <span className="text-mist">— {special.blurb}</span> : null}
          </p>
        ) : null}

        <div className="mt-12 space-y-8">
          {boards.length ? (
            boards.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="The printed menu board" className="block w-full" />
            ))
          ) : (
            <PrintedBoard />
          )}
        </div>
      </div>
    </SiteChrome>
  );
}

/* Shown until a photo of the board is dropped into the hub. One sheet, set like the board on the trailer wall. */
function PrintedBoard() {
  const items = publicMenu();
  const drinks = items.filter((i) => i.kind === "drink");
  const food = items.filter((i) => i.kind === "food");

  return (
    <div className="board mx-auto w-full bg-white px-8 py-12 text-navy sm:px-14 sm:py-16">
      <div className="grid gap-14 md:grid-cols-2 md:gap-12">
        <BoardSide title="Drinks" items={drinks} />
        <BoardSide title="Food" items={food} />
      </div>
      <p className="mt-14 text-center font-display text-base font-semibold tracking-tight">not just served, Sent.</p>
    </div>
  );
}

function BoardSide({ title, items }: { title: string; items: ReturnType<typeof publicMenu> }) {
  const cats = [...new Set(items.map((i) => i.cat))];
  return (
    <section>
      <h2 className="font-display text-5xl font-bold uppercase tracking-tight sm:text-6xl">{title}</h2>
      <div className="mt-10 columns-1 gap-10 sm:columns-2 md:columns-1 lg:columns-2">
        {cats.map((cat) => {
          const rows = items.filter((item) => item.cat === cat);
          const labels = [...new Set(rows.flatMap((row) => row.sizes.map((size) => size.label)))];
          const sized = labels.length > 1 && labels.length <= 3 && rows.every((row) => row.sizes.length > 1);
          return (
            <div key={cat} className="mb-9 break-inside-avoid">
              <h3 className="font-display text-[13px] font-bold uppercase tracking-[0.2em]">{cat}</h3>
              {sized ? (
                <p className="mt-1 font-display text-[11px] uppercase tracking-[0.18em] text-mist">{labels.join(" / ")}</p>
              ) : null}
              <ul className="mt-3 space-y-1.5">
                {rows.map((item) => (
                  <li key={item.id} className="flex items-baseline justify-between gap-4 text-base leading-7">
                    <span className="min-w-0">{item.name}</span>
                    <span className="shrink-0 tabular-nums text-mist">
                      {sized
                        ? labels.map((label) => item.sizes.find((size) => size.label === label)?.price ?? "—").join(" / ")
                        : item.sizes.map((size) => zar(size.price).replace("R ", "")).join(" / ")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      {!items.length ? <p className="mt-6 text-sm text-mist">Nothing on yet.</p> : null}
    </section>
  );
}
