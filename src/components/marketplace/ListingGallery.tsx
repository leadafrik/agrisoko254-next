"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/marketplace";

interface Props {
  images: string[];
  title?: string;
}

export default function ListingGallery({ images, title = "Listing" }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (!images.length) {
    return (
      <div className="aspect-[16/10] rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(160,69,46,0.14),_transparent_55%),linear-gradient(135deg,#fffdf8,#f2ece2)] flex items-center justify-center text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
        Agrisoko
      </div>
    );
  }

  const mainSrc = getOptimizedImageUrl(images[activeIdx], { width: 1200, height: 750, fit: "fill" }) || images[activeIdx];

  const prev = () => setActiveIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setActiveIdx((i) => (i + 1) % images.length);

  const lbPrev = () => setLightboxIdx((i) => i !== null ? (i - 1 + images.length) % images.length : 0);
  const lbNext = () => setLightboxIdx((i) => i !== null ? (i + 1) % images.length : 0);

  return (
    <>
      {/* Main image */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-stone-100 cursor-zoom-in" onClick={() => setLightboxIdx(activeIdx)}>
        <img src={mainSrc} alt={title} className="h-full w-full object-cover transition duration-300" />
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow backdrop-blur-sm transition hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-stone-700" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow backdrop-blur-sm transition hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 text-stone-700" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveIdx(i); }}
                  className={`h-1.5 rounded-full transition-all ${i === activeIdx ? "w-5 bg-white" : "w-1.5 bg-white/60"}`}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
          {images.slice(0, 8).map((img, i) => {
            const thumb = getOptimizedImageUrl(img, { width: 240, height: 180, fit: "fill" }) || img;
            return (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`aspect-[4/3] overflow-hidden rounded-xl border-2 transition ${
                  i === activeIdx ? "border-terra-500 ring-1 ring-terra-400" : "border-transparent hover:border-stone-300"
                }`}
              >
                <img src={thumb} alt="" className="h-full w-full object-cover" />
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-stone-950/90 p-4"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            onClick={() => setLightboxIdx(null)}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); lbPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); lbNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <img
            src={getOptimizedImageUrl(images[lightboxIdx], { width: 1600, height: 1200, fit: "limit" }) || images[lightboxIdx]}
            alt={title}
            className="max-h-[90vh] max-w-full rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm text-white/60">
            {lightboxIdx + 1} / {images.length}
          </p>
        </div>
      )}
    </>
  );
}
