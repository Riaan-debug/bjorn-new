export type CollageItem = { src: string; label: string };

/*
 * Pictures sit tight against each other and every row fills itself.
 * Seven pictures tile one band exactly on 2, 4, and 6 columns with dense flow.
 * Whatever is left over shares one flat last row, so the bottom edge stays straight.
 */
const BAND = [
  "col-span-2 row-span-2",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-2",
  "col-span-2 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-1",
];

const TAIL: Record<number, string[]> = {
  1: ["col-span-2 md:col-span-4 lg:col-span-6"],
  2: ["col-span-1 md:col-span-2 lg:col-span-3", "col-span-1 md:col-span-2 lg:col-span-3"],
  3: ["col-span-1 md:col-span-1 lg:col-span-2", "col-span-1 md:col-span-1 lg:col-span-2", "col-span-2 md:col-span-2 lg:col-span-2"],
  4: ["col-span-1 lg:col-span-2", "col-span-1 lg:col-span-2", "col-span-1", "col-span-1"],
  5: ["col-span-1 lg:col-span-2", "col-span-1", "col-span-1", "col-span-1", "col-span-2 md:col-span-4 lg:col-span-1"],
  6: ["col-span-1", "col-span-1", "col-span-1", "col-span-1", "col-span-1 md:col-span-2 lg:col-span-1", "col-span-1 md:col-span-2 lg:col-span-1"],
};

function spans(count: number) {
  const full = Math.floor(count / BAND.length) * BAND.length;
  const tail = TAIL[count - full] || [];
  return [...Array.from({ length: full }, (_, i) => BAND[i % BAND.length]), ...tail];
}

export function Collage({ items, className = "" }: { items: CollageItem[]; className?: string }) {
  const pictures = items.filter((item) => item.src);
  if (!pictures.length) return null;
  const classes = spans(pictures.length);
  return (
    <div className={`collage grid grid-flow-dense grid-cols-2 gap-1 md:grid-cols-4 lg:grid-cols-6 ${className}`}>
      {pictures.map((item, index) => (
        <figure key={`${item.src}-${index}`} className={`relative overflow-hidden bg-line ${classes[index]}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.src} alt={item.label} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        </figure>
      ))}
    </div>
  );
}
