import { useState } from "react";

interface StarsProps {
  value: number | null;
  onChange?: (next: number | null) => void;
  readOnly?: boolean;
  size?: number;
}

const clamp = (n: number) => Math.max(0.5, Math.min(5, Math.round(n * 2) / 2));

/** Five stars, half-step. Click the left half of a star for x.5, right half
 *  for x. Keyboard: arrows adjust by half a star, Home / End jump to 0.5 / 5. */
export function Stars({ value, onChange, readOnly, size = 22 }: StarsProps) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value ?? 0;
  const editable = !readOnly && !!onChange;

  function pick(e: React.MouseEvent<HTMLButtonElement>, base: number) {
    if (!editable) return;
    // A keyboard-triggered click reports detail 0 and an unreliable clientX;
    // treat it as picking the whole star.
    const keyboard = e.detail === 0;
    const rect = e.currentTarget.getBoundingClientRect();
    const half = !keyboard && e.clientX - rect.left < rect.width / 2;
    const next = base - (half ? 0.5 : 0);
    onChange!(value === next ? null : next);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!editable) return;
    const cur = value ?? 0;
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = clamp(cur + 0.5);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = cur <= 0.5 ? null : clamp(cur - 0.5);
    else if (e.key === "Home") next = 0.5;
    else if (e.key === "End") next = 5;
    else return;
    e.preventDefault();
    onChange!(next);
  }

  return (
    <div
      className="stars"
      role={editable ? "slider" : "img"}
      tabIndex={editable ? 0 : undefined}
      aria-label={value ? `${value} of 5 stars` : "Not rated"}
      aria-valuenow={value ?? 0}
      aria-valuemin={0}
      aria-valuemax={5}
      aria-valuetext={value ? `${value} of 5` : "not rated"}
      onKeyDown={onKeyDown}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, shown - (n - 1)));
        return (
          <button
            key={n}
            type="button"
            className={`star${editable ? "" : " readonly"}`}
            style={{
              ["--f" as string]: String(fill),
              width: size,
              height: size,
              fontSize: size - 2,
              lineHeight: `${size}px`,
            }}
            tabIndex={-1}
            onMouseMove={(e) => {
              if (!editable) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const half = e.clientX - rect.left < rect.width / 2;
              setHover(n - (half ? 0.5 : 0));
            }}
            onMouseLeave={() => setHover(null)}
            onClick={(e) => pick(e, n)}
            aria-hidden="true"
          >
            <span className="fill">★</span>★
          </button>
        );
      })}
    </div>
  );
}
