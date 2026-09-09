import type { ReactNode } from "react";

/**
 * Shared loading, empty and error states for the list and grid screens.
 * One place so every surface fails and empties the same way.
 */

function TicketGlyph() {
  return (
    <svg className="state-glyph" viewBox="0 0 48 32" aria-hidden="true">
      <path
        d="M4 4h40v7a5 5 0 0 0 0 10v7H4v-7a5 5 0 0 0 0-10V4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M31 4v24" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="2 4" />
    </svg>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="state-block">
      <TicketGlyph />
      <p className="state-title">{title}</p>
      {hint && <p className="state-hint">{hint}</p>}
      {action && <div className="state-action">{action}</div>}
    </div>
  );
}

export function LoadError({
  note = "That did not load.",
  onRetry,
}: {
  note?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="state-block">
      <p className="state-title">{note}</p>
      <p className="state-hint">Check your connection, then try again.</p>
      {onRetry && (
        <div className="state-action">
          <button type="button" className="btn sm" onClick={onRetry}>
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

/** A grid of poster-shaped placeholders while the real cards load. */
export function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div className="skel-card" key={i}>
          <div className="skel skel-poster" />
          <div className="skel skel-line" style={{ width: "82%" }} />
          <div className="skel skel-line" style={{ width: "48%" }} />
        </div>
      ))}
    </div>
  );
}
