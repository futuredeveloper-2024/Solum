import React, { useEffect } from "react";
import Icon from "./Icon";
import { formatRelativeTime, getPlantStatusMeta } from "../utils/soilFlowState";

export default function PlantModal({
  isOpen,
  mode,
  activePlant,
  formState,
  formError,
  onClose,
  onEdit,
  onDelete,
  onWater,
  onSubmit,
  onInputChange,
  onImageChange,
  plantFormRef,
  plantImageInputRef,
}) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const isEditing = mode === "edit";
  const isDetailsView = mode === "details";
  const modalEyebrow = mode === "create" ? "Create" : mode === "edit" ? "Update" : "Details";
  const modalTitle =
    mode === "create"
      ? "Add Plant"
      : mode === "edit"
        ? "Edit Plant"
        : activePlant?.name || "Plant Details";
  const saveButtonLabel = mode === "edit" ? "Update Plant" : "Confirm";
  const statusMeta = activePlant ? getPlantStatusMeta(activePlant.moisture) : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto modal-scroll" role="dialog" aria-modal="true">
      <div
        className="modal-backdrop absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 flex min-h-full items-end justify-center p-3 sm:p-4 sm:items-center">
        <div className="modal-panel my-4 w-full max-w-lg max-h-[calc(100vh-1.5rem)] overflow-y-auto rounded-[1.5rem] border border-border bg-card shadow-2xl shadow-black/50 sm:my-6 sm:max-h-[calc(100vh-2rem)]">
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-card px-4 py-4 sm:px-5">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {modalEyebrow}
              </p>
              <h3 className="break-words font-heading text-xl font-semibold text-foreground">{modalTitle}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Close plant modal"
            >
              <Icon icon="solar:close-circle-linear" className="size-5" />
            </button>
          </div>

          {isDetailsView && activePlant && statusMeta ? (
            <div className="p-4 sm:p-5">
              <div className="flex flex-col gap-5">
                <div className="overflow-hidden rounded-[1.25rem] border border-border bg-muted/40">
                  <img
                    src={activePlant.image}
                    alt={activePlant.name}
                    className="h-64 w-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h4 className="break-words font-heading text-2xl font-semibold text-foreground">
                      {activePlant.name}
                    </h4>
                    <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusMeta.badgeClass}`}>
                      <span className={`h-2 w-2 rounded-full ${statusMeta.dotClass}`} />
                      {statusMeta.shortLabel}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{activePlant.desc}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-[1rem] border border-border bg-background px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Moisture</p>
                    <p className="mt-2 font-heading text-lg font-semibold text-foreground">
                      {activePlant.moisture}%
                    </p>
                  </div>
                  <div className="rounded-[1rem] border border-border bg-background px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Last watered</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {formatRelativeTime(activePlant.lastWateredAt)}
                    </p>
                  </div>
                  <div className="rounded-[1rem] border border-border bg-background px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Status</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">{statusMeta.label}</p>
                  </div>
                </div>
                <p className="rounded-[1rem] border border-border bg-background px-4 py-3 text-sm leading-6 text-muted-foreground">
                  {statusMeta.helperText}
                </p>
                <div className="grid gap-3 md:grid-cols-3">
                  <button
                    type="button"
                    onClick={onWater}
                    className="rounded-[1.1rem] bg-chart-3/10 px-4 py-3 text-sm font-semibold text-chart-3 transition-colors hover:bg-chart-3/20"
                  >
                    Water Plant
                  </button>
                  <button
                    type="button"
                    onClick={onEdit}
                    className="rounded-[1.1rem] bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-95"
                  >
                    Edit Plant
                  </button>
                  <button
                    type="button"
                    onClick={onDelete}
                    className="rounded-[1.1rem] bg-accent/10 px-4 py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent/20"
                  >
                    Delete Plant
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form ref={plantFormRef} onSubmit={onSubmit} className="p-4 sm:p-5">
              <input type="hidden" value={formState.id} readOnly />
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-foreground">Image</span>
                  <input
                    ref={plantImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onImageChange}
                    className="rounded-[1rem] border border-border bg-background px-4 py-3 text-sm text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground"
                  />
                </label>

                {formState.imagePreview ? (
                  <div className="overflow-hidden rounded-[1.25rem] border border-border bg-muted/40">
                    <img
                      src={formState.imagePreview}
                      alt="Selected plant preview"
                      className="h-48 w-full object-cover"
                    />
                  </div>
                ) : null}

                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-foreground">Plant Name</span>
                  <input
                    name="name"
                    type="text"
                    value={formState.name}
                    onChange={onInputChange}
                    placeholder="Enter plant name"
                    className="rounded-[1rem] border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-foreground">Description</span>
                  <textarea
                    name="desc"
                    rows="4"
                    value={formState.desc}
                    onChange={onInputChange}
                    placeholder="Describe this plant"
                    className="rounded-[1rem] border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary"
                  />
                </label>

                {formError ? (
                  <p className="text-sm font-medium text-accent">{formError}</p>
                ) : null}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                  >
                    {saveButtonLabel}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
