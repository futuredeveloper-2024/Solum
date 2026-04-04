import React, { useEffect, useState } from "react";
import ConfirmationDialog from "../components/ConfirmationDialog";
import Icon from "../components/Icon";
import {
  AUTOMATION_NAME_MAX_LENGTH,
  DAY_OPTIONS,
  MAX_PLANTS,
  formatAutomationSchedule,
  formatTimeLabel,
  normalizeAutomation,
} from "../utils/soilFlowState";

function createEmptyAutomationForm() {
  return {
    id: "",
    name: "",
    time: "07:30",
    days: ["mon", "wed", "fri"],
    plants: [],
    isActive: true,
  };
}

function getPlantNames(plants, plantIds) {
  const plantNames = plantIds
    .map((plantId) => plants.find((plant) => plant.id === plantId)?.name)
    .filter(Boolean);

  return plantNames.length ? plantNames : ["Plant removed"];
}

export default function Automations({ plants, automations, setAutomations, onNavigate, notify }) {
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const [deleteCandidateId, setDeleteCandidateId] = useState("");
  const [formState, setFormState] = useState(createEmptyAutomationForm);
  const [formError, setFormError] = useState("");

  function showNotification(type, title, message) {
    notify?.({ type, title, message });
  }

  useEffect(() => {
    const validPlantIds = new Set(plants.map((plant) => plant.id));

    setFormState((currentState) => {
      const nextPlants = currentState.plants
        .filter((plantId) => validPlantIds.has(plantId))
        .slice(0, MAX_PLANTS);

      if (
        nextPlants.length === currentState.plants.length &&
        nextPlants.every((plantId, index) => plantId === currentState.plants[index])
      ) {
        return currentState;
      }

      return {
        ...currentState,
        plants: nextPlants,
      };
    });
  }, [plants]);

  function resetForm() {
    setFormState(createEmptyAutomationForm());
    setFormError("");
  }

  function openCreateAutomationForm() {
    resetForm();
    setIsEditorVisible(true);
  }

  function closeEditor() {
    resetForm();
    setIsEditorVisible(false);
  }

  function handleInputChange(event) {
    const { name, value } = event.target;
    setFormState((currentState) => ({
      ...currentState,
      [name]: name === "name" ? value.slice(0, AUTOMATION_NAME_MAX_LENGTH) : value,
    }));

    if (formError) {
      setFormError("");
    }
  }

  function toggleDay(dayKey) {
    setFormState((currentState) => {
      const hasDay = currentState.days.includes(dayKey);
      const nextDays = hasDay
        ? currentState.days.filter((day) => day !== dayKey)
        : [...currentState.days, dayKey];

      return {
        ...currentState,
        days: nextDays,
      };
    });

    if (formError) {
      setFormError("");
    }
  }

  function togglePlantSelection(plantId) {
    let exceededLimit = false;

    setFormState((currentState) => {
      const isSelected = currentState.plants.includes(plantId);

      if (isSelected) {
        return {
          ...currentState,
          plants: currentState.plants.filter((selectedPlantId) => selectedPlantId !== plantId),
        };
      }

      if (currentState.plants.length >= MAX_PLANTS) {
        exceededLimit = true;
        return currentState;
      }

      return {
        ...currentState,
        plants: [...currentState.plants, plantId],
      };
    });

    if (exceededLimit) {
      setFormError("You can assign up to 8 plants per automation.");
      showNotification("error", "Too many plants", "You can assign up to 8 plants per automation.");
      return;
    }

    if (formError) {
      setFormError("");
    }
  }

  function toggleSelectAllPlants() {
    const allPlantIds = plants.map((plant) => plant.id).slice(0, MAX_PLANTS);

    setFormState((currentState) => {
      const isAllSelected =
        allPlantIds.length > 0 &&
        currentState.plants.length === allPlantIds.length &&
        allPlantIds.every((plantId) => currentState.plants.includes(plantId));

      return {
        ...currentState,
        plants: isAllSelected ? [] : allPlantIds,
      };
    });

    if (formError) {
      setFormError("");
    }
  }

  function validateAutomationForm() {
    if (!formState.name.trim() || !formState.time || !formState.days.length) {
      setFormError("Please complete the automation name, time, and days.");
      showNotification("error", "Missing information", "Please complete the automation name, time, and days.");
      return false;
    }

    if (!formState.plants.length) {
      setFormError("Select at least one plant for this automation.");
      showNotification("error", "Plant selection needed", "Select at least one plant for this automation.");
      return false;
    }

    if (formState.plants.length > MAX_PLANTS) {
      setFormError("You can assign up to 8 plants per automation.");
      showNotification("error", "Too many plants", "You can assign up to 8 plants per automation.");
      return false;
    }

    return true;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validateAutomationForm()) {
      return;
    }

    const payload = normalizeAutomation(
      {
        ...formState,
        name: formState.name.trim(),
      },
      automations.length,
    );

    if (formState.id) {
      setAutomations((currentAutomations) =>
        currentAutomations.map((automation) =>
          automation.id === formState.id ? payload : automation,
        ),
      );
      showNotification("success", "Automation updated", `${payload.name} was updated.`);
    } else {
      setAutomations((currentAutomations) => [
        ...currentAutomations,
        {
          ...payload,
          id: `${Date.now()}-automation`,
        },
      ]);
      showNotification("success", "Automation created", `${payload.name} is now active.`);
    }

    closeEditor();
  }

  function startEditing(automation) {
    const normalizedAutomation = normalizeAutomation(automation);
    const availablePlantIds = new Set(plants.map((plant) => plant.id));

    setFormState({
      ...normalizedAutomation,
      plants: normalizedAutomation.plants.filter((plantId) => availablePlantIds.has(plantId)),
    });
    setFormError("");
    setIsEditorVisible(true);
  }

  function requestDeleteAutomation(id) {
    if (!id) {
      return;
    }

    setDeleteCandidateId(id);
  }

  function cancelDeleteAutomation() {
    setDeleteCandidateId("");
  }

  function confirmDeleteAutomation(id) {
    if (!id) {
      return;
    }

    setAutomations((currentAutomations) =>
      currentAutomations.filter((automation) => automation.id !== id),
    );
    setDeleteCandidateId("");
    showNotification("success", "Automation deleted", "The automation was removed.");

    if (formState.id === id) {
      closeEditor();
    }
  }

  function toggleAutomationActive(id) {
    const targetAutomation = automations.find((automation) => automation.id === id);
    const nextIsActive = targetAutomation?.isActive === false;

    setAutomations((currentAutomations) =>
      currentAutomations.map((automation) =>
        automation.id === id
          ? {
              ...automation,
              isActive: nextIsActive,
            }
          : automation,
      ),
    );

    if (formState.id === id) {
      setFormState((currentState) => ({
        ...currentState,
        isActive: !currentState.isActive,
      }));
    }

    showNotification(
      nextIsActive ? "success" : "info",
      nextIsActive ? "Automation activated" : "Automation paused",
      `${targetAutomation?.name || "This automation"} is now ${nextIsActive ? "active" : "inactive"}.`,
    );
  }

  const canCreateAutomation = plants.length > 0;
  const visiblePlantLimit = Math.min(plants.length, MAX_PLANTS);
  const allVisiblePlantIds = plants.map((plant) => plant.id).slice(0, MAX_PLANTS);
  const activeAutomationCount = automations.filter((automation) => automation.isActive !== false).length;
  const allPlantsSelected =
    allVisiblePlantIds.length > 0 &&
    formState.plants.length === allVisiblePlantIds.length &&
    allVisiblePlantIds.every((plantId) => formState.plants.includes(plantId));
  const layoutClassName = isEditorVisible
    ? "grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
    : "grid gap-4";

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      <div className="mobile-card rounded-[1.25rem] border border-border bg-gradient-to-br from-secondary to-card p-4 shadow-md sm:p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-secondary-foreground">Automation Center</p>
        <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">
          Routines and Triggers
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Create custom watering schedules for plant groups, then revisit them any time to adjust names, selected days, assigned plants, or time slots.
        </p>
      </div>

      <div className="mobile-card rounded-[1.25rem] border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Quick Action</p>
            <h3 className="mt-1 font-heading text-lg font-semibold text-foreground">Manage Automations</h3>
          </div>
          <button
            type="button"
            onClick={openCreateAutomationForm}
            className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <Icon icon="solar:add-circle-bold" className="size-4" />
            <span>Add Automation</span>
          </button>
        </div>
      </div>

      <div className={layoutClassName}>
        {isEditorVisible ? (
          <form
            onSubmit={handleSubmit}
            className="panel-transition mobile-card rounded-[1.25rem] border border-border bg-card p-4 shadow-sm sm:p-5"
          >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Editor</p>
                <h3 className="font-heading text-lg font-semibold text-foreground">
                  {formState.id ? "Edit Automation" : "New Automation"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="self-start rounded-full bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {formState.id ? "Cancel edit" : "Cancel"}
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-foreground">Automation Name</span>
                <input
                  name="name"
                  type="text"
                  maxLength={AUTOMATION_NAME_MAX_LENGTH}
                  value={formState.name}
                  onChange={handleInputChange}
                  placeholder="Morning hydration"
                  disabled={!canCreateAutomation}
                  className="rounded-[1rem] border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                />
                <span className="text-xs text-muted-foreground">
                  {formState.name.length}/{AUTOMATION_NAME_MAX_LENGTH} characters
                </span>
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-foreground">Time</span>
                <input
                  name="time"
                  type="time"
                  value={formState.time}
                  onChange={handleInputChange}
                  disabled={!canCreateAutomation}
                  className="rounded-[1rem] border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>

              <div className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-foreground">Days</span>
                <div className="flex flex-wrap gap-2">
                  {DAY_OPTIONS.map((day) => {
                    const isActive = formState.days.includes(day.key);

                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => toggleDay(day.key)}
                        disabled={!canCreateAutomation}
                        className={`rounded-full px-3 py-2 text-xs font-semibold transition-all ${isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground"} disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2 text-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-medium text-foreground">Assigned Plants</span>
                  <button
                    type="button"
                    onClick={toggleSelectAllPlants}
                    disabled={!canCreateAutomation}
                    className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {allPlantsSelected ? "Clear all" : "Select All"}
                  </button>
                </div>

                <div className="rounded-[1rem] border border-border bg-background p-3">
                  {plants.length ? (
                    <div className="grid gap-2">
                      {plants.map((plant) => {
                        const isSelected = formState.plants.includes(plant.id);
                        const isSelectionLocked =
                          !isSelected && formState.plants.length >= MAX_PLANTS;

                        return (
                          <button
                            key={plant.id}
                            type="button"
                            onClick={() => togglePlantSelection(plant.id)}
                            disabled={!canCreateAutomation || isSelectionLocked}
                            className={`flex items-center justify-between gap-3 rounded-[0.95rem] border px-3 py-3 text-left transition-all ${isSelected ? "border-primary bg-primary/10 shadow-sm shadow-primary/10" : "border-border bg-card hover:border-primary/30 hover:bg-card/90"} disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">{plant.name}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Included in this automation
                              </p>
                            </div>
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}
                            >
                              {isSelected ? (
                                <Icon icon="solar:check-circle-bold" className="size-4" />
                              ) : null}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Add a plant first to assign it to an automation.</p>
                  )}
                </div>

                <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                  <span>Select plants for each routine.</span>
                  <span>{formState.plants.length}/{visiblePlantLimit || MAX_PLANTS} selected</span>
                </div>
              </div>

              {formError ? <p className="text-sm font-medium text-accent">{formError}</p> : null}

              {!canCreateAutomation ? (
                <div className="rounded-[1rem] border border-dashed border-border bg-background px-4 py-4 text-sm text-muted-foreground">
                  <p>Add at least one plant before creating automations.</p>
                  <button
                    type="button"
                    onClick={() => onNavigate("plants")}
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <Icon icon="solar:leaf-linear" className="size-4" />
                    <span>Open Plants</span>
                  </button>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={!canCreateAutomation}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Icon icon={formState.id ? "solar:pen-bold" : "solar:add-circle-bold"} className="size-4" />
                <span>{formState.id ? "Update Automation" : "Create Automation"}</span>
              </button>
            </div>
          </form>
        ) : null}

        <div className="mobile-card rounded-[1.25rem] border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Saved Routines</p>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Automation List
              </h3>
            </div>
            <span className="self-start rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {activeAutomationCount} / {automations.length} Automations Active
            </span>
          </div>

          {automations.length ? (
            <div className="space-y-3">
              {automations.map((automation) => {
                const normalizedAutomation = normalizeAutomation(automation);
                const linkedPlantIds = normalizedAutomation.plants;
                const linkedPlantNames = getPlantNames(plants, linkedPlantIds);
                const isActive = normalizedAutomation.isActive;

                return (
                  <div
                    key={automation.id}
                    className={`rounded-[1.1rem] border px-4 py-4 transition-colors ${isActive ? "border-primary/25 bg-background shadow-sm shadow-primary/5" : "border-border bg-background/70 opacity-80"}`}
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-heading text-base font-semibold text-foreground">
                          {automation.name}
                        </h4>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatAutomationSchedule(automation)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleAutomationActive(automation.id)}
                          aria-pressed={isActive}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${isActive ? "bg-primary/10 text-primary hover:bg-primary/20" : "bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                        >
                          <span className={`h-2 w-2 rounded-full ${isActive ? "bg-primary" : "bg-muted-foreground/70"}`} />
                          {isActive ? "Active" : "Inactive"}
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditing(automation)}
                          className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => requestDeleteAutomation(automation.id)}
                          className="rounded-full bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/20"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 lg:grid-cols-2">
                      <div className="rounded-[0.9rem] border border-border bg-card px-3 py-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Plants</p>
                        <p className="mt-2 text-sm font-semibold text-foreground">
                          {linkedPlantIds.length} selected
                        </p>
                        <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">
                          {linkedPlantNames.join(", ")}
                        </p>
                      </div>
                      <div className="rounded-[0.9rem] border border-border bg-card px-3 py-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Time</p>
                        <p className="mt-2 text-sm font-semibold text-foreground">
                          {formatTimeLabel(automation.time)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {isActive ? "Runs on schedule" : "Paused from Home scheduling"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[1rem] border border-dashed border-border bg-background px-4 py-5 text-center text-sm text-muted-foreground">
              <div className="flex flex-col items-center gap-3">
                <Icon icon="solar:clock-circle-linear" className="size-8 text-primary/50" />
                <p>No automations created yet. Build your first routine from the editor.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={Boolean(deleteCandidateId)}
        title="Delete Automation"
        message="Are you sure you want to delete this automation?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="danger"
        onCancel={cancelDeleteAutomation}
        onConfirm={() => confirmDeleteAutomation(deleteCandidateId)}
      />
    </div>
  );
}
