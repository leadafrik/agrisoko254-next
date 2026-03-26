"use client";

type StatusItem = {
  label: string;
  value: string;
};

type Props = {
  items: StatusItem[];
  className?: string;
};

export default function IntelligenceStatusStrip({ items, className = "" }: Props) {
  if (!items.length) return null;

  return (
    <div className={`grid gap-3 sm:grid-cols-2 xl:grid-cols-4 ${className}`}>
      {items.map((item) => (
        <div
          key={`${item.label}-${item.value}`}
          className="rounded-[22px] border border-stone-200 bg-white/85 px-4 py-3 shadow-[0_16px_36px_-34px_rgba(120,83,47,0.45)]"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            {item.label}
          </p>
          <p className="mt-2 text-lg font-bold text-stone-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
