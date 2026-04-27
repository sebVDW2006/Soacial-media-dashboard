import Image from "next/image";
import type { InspirationArtwork } from "@/lib/inspiration";

export function InspirationGallery({
  title,
  copy,
  artworks,
}: {
  title: string;
  copy: string;
  artworks: InspirationArtwork[];
}) {
  return (
    <section className="app-card p-7 sm:p-8 lg:p-10">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="eyebrow">Creative atmosphere</div>
          <h2 className="sub-title mt-3 text-[var(--brand)]">{title}</h2>
          <p className="mt-4 text-sm leading-8 text-[var(--ink-soft)] sm:text-base">{copy}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {artworks.map((artwork) => (
          <article key={artwork.src} className="soft-card overflow-hidden">
            <div className="relative aspect-[4/3]">
              <Image
                src={artwork.src}
                alt={`${artwork.title} by ${artwork.artist}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1536px) 50vw, 25vw"
              />
            </div>
            <div className="space-y-2 p-5">
              <p className="text-lg font-semibold tracking-[-0.03em] text-[var(--brand)]">{artwork.title}</p>
              <p className="text-sm text-[var(--ink-soft)]">{artwork.artist}</p>
              <p className="text-sm leading-7 text-[var(--ink-soft)]">{artwork.mood}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

