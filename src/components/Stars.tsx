import { useState } from "react";

interface StarsProps {
  value: number | null;
  onChange?: (next: number | null) => void;
  readOnly?: boolean;
  size?: number;
}

/** Five stars, half-step. Click the left half of a star for x.5, right half for x. */
export function Stars({ value, onChange, readOnly, size = 22 }: StarsProps) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value ?? 0;

  function pick(e: React.MouseEvent<HTMLButtonElement>, base: number) {
    if (readOnly || !onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const half = e.clientX - rect.left < rect.width / 2;
    const next = base - (half ? 0.5 : 0);
    onChange(value === next ? null : next);
  }

  return (
    <div
      className="stars"
      role={readOnly ? "img" : "slider"}
      aria-label={value ? `${value} of 5` : "not rated"}
      aria-valuenow={value ?? 0}
      aria-valuemin={0}
      aria-valuemax={5}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, shown - (n - 1)));
        return (
          <button
            key={n}
            type="button"
            className={`star${readOnly ? " readonly" : ""}`}
            style={{ ["--f" as string]: String(fill), width: size, height: size, fontSize: size - 2, lineHeight: `${size}px` }}
            tabIndex={readOnly ? -1 : 0}
            onMouseMove={(e) => {
              if (readOnly) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const half = e.clientX - rect.left < rect.width / 2;
              setHover(n - (half ? 0.5 : 0));
            }}
            onMouseLeave={() => setHover(null)}
            onClick={(e) => pick(e, n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <span className="fill">★</span>★
          </button>
        );
      })}
    </div>
  );
}
