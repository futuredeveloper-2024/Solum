import React, { useEffect } from "react";
import Icon from "./Icon";

export default function ConfirmationDialog({
  isOpen,
  title = "Confirm Action",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  const confirmButtonClass =
    tone === "danger"
      ? "bg-accent text-accent-foreground hover:brightness-105"
      : "bg-primary text-primary-foreground hover:brightness-105";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" role="alertdialog" aria-modal="true">
      <div
        className="modal-backdrop absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="confirm-panel relative z-10 w-full max-w-sm rounded-[1.5rem] border border-border bg-card p-5 shadow-2xl shadow-black/40">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-full bg-accent/10 p-2 text-accent">
            <Icon icon="solar:shield-warning-bold" className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-full px-4 py-2 text-sm font-semibold shadow-lg shadow-black/10 transition-all active:scale-95 ${confirmButtonClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
