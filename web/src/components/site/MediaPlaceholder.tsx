import { BeanDrift, type BeanPreset } from "@/components/site/BeanDrift";

export function MediaPlaceholder({
  label = "Photo coming soon",
  className = "",
  ratio = "aspect-[4/3]",
  drift,
}: {
  label?: string;
  className?: string;
  ratio?: string;
  drift?: BeanPreset;
}) {
  return (
    <div className={`placeholder-media relative overflow-hidden ${ratio} ${className}`}>
      {drift ? <BeanDrift preset={drift} tone="navy" /> : null}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 px-6 text-center">
        <span className="text-[10px] uppercase tracking-[0.28em] text-mist">Placeholder</span>
        <span className="font-display text-sm text-navy/70">{label}</span>
      </div>
    </div>
  );
}
