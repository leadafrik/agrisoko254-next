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
    <div
      className={`overflow-hidden rounded-[30px] border border-stone-200 bg-white shadow-[0_22px_54px_-40px_rgba(120,83,47,0.28)] ${className}`}
    >
      <div className="border-b border-stone-200 bg-[#fcf8f2] px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
              {title}
            </p>
            {description ? (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
                {description}
              </p>
            ) : null}
          </div>
          <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold text-stone-600">
            {products.length} tracked
          </span>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-4">
        {products.map((product) => {
          const isActive = product.key === selectedKey;

          return (
            <button
              key={product.key}
              type="button"
              onClick={() => onSelect(product.key)}
              className={`rounded-[24px] border p-4 text-left transition ${
                isActive
                  ? "border-terra-300 bg-terra-50 shadow-[0_22px_48px_-40px_rgba(169,78,44,0.45)]"
                  : "border-stone-200 bg-[#fffdf9] hover:-translate-y-0.5 hover:border-terra-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-stone-900">{product.name}</h3>
                  {product.helper ? (
                    <p className="mt-2 text-sm leading-relaxed text-stone-500">{product.helper}</p>
                  ) : null}
                </div>
                <span
                  className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                    isActive ? "bg-terra-500 shadow-[0_0_0_5px_rgba(169,78,44,0.16)]" : "bg-stone-200"
                  }`}
                  aria-hidden="true"
                />
              </div>
              {product.value ? (
                <p className="mt-4 text-2xl font-bold text-stone-900">{product.value}</p>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
