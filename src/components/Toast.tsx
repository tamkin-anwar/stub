import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface ToastItem {
  id: number;
  text: string;
  error?: boolean;
}

type Push = (text: string, opts?: { error?: boolean }) => void;

const ToastContext = createContext<Push>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback<Push>(
    (text, opts) => {
      const id = Date.now() + Math.random();
      const error = !!opts?.error;
      setItems((prev) => [...prev, { id, text, error }]);
      // errors linger so they can be read; anything can be tapped away early
      window.setTimeout(() => dismiss(id), error ? 6500 : 2800);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="toast-wrap" role="status" aria-live="polite">
        {items.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`toast${t.error ? " toast-error" : ""}`}
            onClick={() => dismiss(t.id)}
          >
            {t.text}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
