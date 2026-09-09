import type { ReactNode } from "react";

/** A titled section on the home page: an eyebrow label, a display heading,
 *  an optional action on the right, and whatever content sits below. */
export function Shelf({
  label,
  title,
  more,
  children,
}: {
  label: string;
  title: string;
  more?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section style={{ marginBottom: 44 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          paddingBottom: 12,
          marginBottom: 20,
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            {label}
          </div>
          <h2 className="display" style={{ fontSize: 24 }}>
            {title}
          </h2>
        </div>
        {more}
      </div>
      {children}
    </section>
  );
}
