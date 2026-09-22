type BeanSpot = { left?: string; right?: string; top: string; size: number };

const PRESETS = {
  hero: [
    { left: "5%", top: "16%", size: 34 },
    { left: "88%", top: "20%", size: 42 },
    { left: "91%", top: "60%", size: 28 },
    { left: "4%", top: "66%", size: 48 },
    { left: "78%", top: "7%", size: 22 },
    { left: "13%", top: "86%", size: 26 },
  ],
  slogan: [
    { left: "4%", top: "10%", size: 30 },
    { left: "48%", top: "42%", size: 18 },
  ],
  story: [
    { left: "12%", top: "8%", size: 26 },
    { left: "58%", top: "18%", size: 44 },
    { left: "30%", top: "46%", size: 18 },
    { left: "72%", top: "58%", size: 32 },
    { left: "6%", top: "70%", size: 16 },
    { left: "42%", top: "28%", size: 14 },
  ],
  counter: [
    { left: "8%", top: "12%", size: 30 },
    { left: "34%", top: "28%", size: 18 },
    { left: "58%", top: "8%", size: 36 },
    { left: "84%", top: "30%", size: 20 },
  ],
  gutter: [
    { left: "1.2%", top: "12%", size: 30 },
    { right: "1.4%", top: "16%", size: 28 },
    { right: "2%", top: "74%", size: 22 },
    { left: "1.4%", top: "70%", size: 26 },
  ],
  stillWide: [
    { left: "7%", top: "16%", size: 34 },
    { left: "82%", top: "12%", size: 26 },
    { left: "88%", top: "64%", size: 42 },
    { left: "12%", top: "70%", size: 22 },
    { left: "46%", top: "18%", size: 16 },
    { left: "64%", top: "76%", size: 20 },
  ],
  stillSmash: [
    { left: "10%", top: "14%", size: 28 },
    { left: "68%", top: "20%", size: 16 },
    { left: "16%", top: "68%", size: 20 },
    { left: "70%", top: "62%", size: 34 },
  ],
  stillPour: [
    { left: "64%", top: "12%", size: 32 },
    { left: "12%", top: "26%", size: 16 },
    { left: "18%", top: "66%", size: 24 },
    { left: "68%", top: "72%", size: 18 },
  ],
  about: [
    { left: "8%", top: "16%", size: 30 },
    { left: "18%", top: "64%", size: 18 },
    { left: "62%", top: "72%", size: 34 },
    { left: "78%", top: "46%", size: 16 },
  ],
  teamOne: [
    { left: "10%", top: "14%", size: 24 },
    { left: "66%", top: "68%", size: 30 },
    { left: "18%", top: "72%", size: 14 },
  ],
  teamTwo: [
    { left: "76%", top: "10%", size: 22 },
    { left: "8%", top: "70%", size: 22 },
    { left: "70%", top: "76%", size: 16 },
  ],
  menu: [
    { left: "2.5%", top: "1.4%", size: 20 },
    { right: "3%", top: "1.8%", size: 24 },
    { left: "2%", top: "96.5%", size: 22 },
    { right: "3.5%", top: "95.5%", size: 18 },
  ],
  stillCounter: [
    { left: "14%", top: "16%", size: 20 },
    { left: "66%", top: "24%", size: 36 },
    { left: "10%", top: "64%", size: 16 },
    { left: "56%", top: "70%", size: 24 },
  ],
} satisfies Record<string, BeanSpot[]>;

export type BeanPreset = keyof typeof PRESETS;

export function BeanDrift({
  preset = "hero",
  tone = "cream",
  className = "",
}: {
  preset?: keyof typeof PRESETS;
  tone?: "cream" | "navy";
  className?: string;
}) {
  const tight = preset === "slogan" || preset === "counter" || preset === "menu";
  return (
    <div className={`bean-drift bean-drift-${tone} ${tight ? "bean-drift-tight" : ""} ${className}`} aria-hidden>
      {PRESETS[preset].map((bean, index) => (
        <span
          key={index}
          className={`bean-drift-item bean-drift-item-${(index % 6) + 1}`}
          style={{
            left: bean.left,
            right: bean.right,
            top: bean.top,
            width: bean.size,
            height: bean.size * 1.45,
            animationDelay: `${index * -2.6}s`,
          }}
        >
          <svg viewBox="0 0 40 58" fill="none">
            <ellipse cx="20" cy="29" rx="15" ry="26" fill="currentColor" />
            <path className="bean-crease" d="M20 7c-5 9 5 18 0 44" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
      ))}
    </div>
  );
}
