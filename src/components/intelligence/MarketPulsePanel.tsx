"use client";

type Props = {
  title?: string;
  items: string[];
  className?: string;
};

export default function MarketPulsePanel({
  title = "Market pulse",
  items,
  className = "",
}: Props) {
  if (!items.length) return null;

  return (
    <div className={`surface-card p-6 ${className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
        {title}
      </p>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-[20px] border border-stone-200 bg-[#fbf8f2] px-4 py-3 text-sm leading-relaxed text-stone-700"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
