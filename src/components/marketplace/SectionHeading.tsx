import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  align?: "left" | "center";
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  actions,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "flex flex-col gap-4 md:flex-row md:items-end md:justify-between"}>
      <div className={align === "center" ? "" : "max-w-2xl"}>
        {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
        <h2 className="mt-3 text-3xl font-bold text-stone-900 sm:text-4xl">{title}</h2>
        {description ? <p className="mt-3 text-base leading-relaxed text-stone-600">{description}</p> : null}
      </div>
      {actions ? <div className={align === "center" ? "mt-5 flex justify-center" : "shrink-0"}>{actions}</div> : null}
    </div>
  );
}

