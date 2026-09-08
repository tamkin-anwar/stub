import { Component, type ErrorInfo, type ReactNode } from "react";

interface State {
  error: Error | null;
}

/** Catches render errors anywhere below it so a single broken component
 *  doesn't blank the whole app. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Stub render error:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="center-note" style={{ display: "grid", gap: 12, placeItems: "center" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>Something broke.</p>
        <p style={{ maxWidth: "40ch" }}>
          That's on us. Reloading usually clears it; if it keeps happening, let us know.
        </p>
        <button className="btn sm" onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    );
  }
}
