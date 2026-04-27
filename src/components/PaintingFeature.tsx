import Image from "next/image";
import type { InspirationArtwork } from "@/lib/inspiration";

export function PaintingFeature({
  artwork,
  eyebrow,
  title,
  copy,
  align = "bottom",
  heightClass = "min-h-[420px]",
}: {
  artwork: InspirationArtwork;
  eyebrow: string;
  title: string;
  copy: string;
  align?: "top" | "bottom";
  heightClass?: string;
}) {
  return (
    <section className={`painting-feature ${heightClass}`}>
      <Image
        src={artwork.src}
        alt={`${artwork.title} by ${artwork.artist}`}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 40vw"
      />
      <div className={`painting-overlay ${align === "top" ? "justify-start" : "justify-end"}`}>
        <div className="space-y-3">
          <div className="painting-meta">{eyebrow}</div>
          <h3 className="text-[2rem] font-semibold tracking-[-0.05em] text-white sm:text-[2.5rem]">
            {title}
          </h3>
          <p className="max-w-xl text-sm leading-7 text-white/80 sm:text-base">{copy}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="painting-chip">{artwork.title}</span>
            <span className="painting-chip">{artwork.artist}</span>
            <span className="painting-chip">{artwork.mood}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

