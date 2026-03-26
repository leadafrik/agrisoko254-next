"use client";

type Props = {
  value: number;
  size?: number;
  showValue?: boolean;
};

export default function StarRating({ value, size = 18, showValue = true }: Props) {
  const clamped = Math.max(0, Math.min(5, Math.round(value * 2) / 2));
  const fills = Array.from({ length: 5 }, (_, i) => {
    const idx = i + 1;
    if (clamped >= idx) return 1 as 0 | 0.5 | 1;
    if (clamped >= idx - 0.5) return 0.5 as 0 | 0.5 | 1;
    return 0 as 0 | 0.5 | 1;
  });

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }} aria-label={`Rating ${clamped} out of 5`}>
      {fills.map((f, idx) => <Star key={idx} fill={f} size={size} />)}
      {showValue && <span style={{ marginLeft: 4, fontSize: size * 0.75 }}>{clamped.toFixed(1)}</span>}
    </div>
  );
}

function Star({ fill, size }: { fill: 0 | 0.5 | 1; size: number }) {
  const fullColor = "#f5a623";
  const emptyColor = "#ddd";
  const path = "M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.401 8.172L12 18.896 4.665 23.17l1.401-8.172L.132 9.211l8.2-1.193L12 .587z";

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d={path} fill={emptyColor} />
      {fill > 0 && (
        <>
          <clipPath id={`clip-${fill}`}>
            <rect x="0" y="0" width={fill === 0.5 ? 12 : 24} height="24" />
          </clipPath>
          <path d={path} fill={fullColor} clipPath={fill === 0.5 ? `url(#clip-0.5)` : undefined} />
        </>
      )}
    </svg>
  );
}
