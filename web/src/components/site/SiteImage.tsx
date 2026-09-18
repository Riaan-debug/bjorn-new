import { MediaPlaceholder } from "@/components/site/MediaPlaceholder";

export function SiteImage({
  src,
  label,
  className = "",
  ratio = "aspect-[4/3]",
}: {
  src?: string;
  label: string;
  className?: string;
  ratio?: string;
}) {
  if (!src) return <MediaPlaceholder label={label} className={className} ratio={ratio} />;
  return (
    <div className={`relative overflow-hidden bg-line ${ratio} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={label} className="absolute inset-0 h-full w-full object-cover" />
    </div>
  );
}
