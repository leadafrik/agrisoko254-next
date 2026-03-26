"use client";

type CommodityItem = {
  key: string;
  name: string;
  value?: string;
  helper?: string;
};

type Props = {
  title?: string;
  description?: string;
  products: CommodityItem[];
  selectedKey: string;
  onSelect: (productKey: string) => void;
  className?: string;
};

export default function CommodityQuickPicker({
  title = "Choose a commodity",
  description,
  products,
  selectedKey,
  onSelect,
  className = "",
}: Props) {
  return (
    <div className={`surface-card p-6 ${className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
        {title}
      </p>
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-stone-600">{description}</p>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {products.map((product) => {
          const isActive = product.key === selectedKey;

          return (
            <button
              key={product.key}
              type="button"
              onClick={() => onSelect(product.key)}
              className={`rounded-[22px] border p-4 text-left transition ${
                isActive
                  ? "border-terra-300 bg-terra-50 shadow-[0_18px_44px_-36px_rgba(169,78,44,0.35)]"
                  : "border-stone-200 bg-[#fbf8f2] hover:border-terra-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Commodity
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-stone-900">{product.name}</h3>
                </div>
                {product.value ? (
                  <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold text-stone-600">
                    {product.value}
                  </span>
                ) : null}
              </div>
              {product.helper ? (
                <p className="mt-3 text-sm leading-relaxed text-stone-500">{product.helper}</p>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
