import { useEffect, useRef } from "react";

interface Props {
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** A small yes/cancel modal, styled like the rest of the app. Replaces
 *  window.confirm so the flow stays inside Stub. */
export function ConfirmDialog({
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger,
  onConfirm,
  onClose,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && !el.open) el.showModal();
  }, []);

  function close() {
    ref.current?.close();
    onClose();
  }

  return (
    <dialog
      ref={ref}
      className="confirm"
      onCancel={close}
      onClick={(e) => e.target === ref.current && close()}
    >
      <div style={{ padding: 22 }}>
        <h2 className="display" style={{ fontSize: 21, marginBottom: body ? 8 : 16 }}>
          {title}
        </h2>
        {body && (
          <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.55, marginBottom: 18 }}>
            {body}
          </p>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn sm" onClick={close}>
            {cancelLabel}
          </button>
          <button
            className={`btn sm ${danger ? "danger-btn" : "primary"}`}
            autoFocus
            onClick={() => {
              onConfirm();
              close();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
