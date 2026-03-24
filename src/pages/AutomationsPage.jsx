import { useEffect, useMemo, useState } from "react";
import BottomNav from "../components/BottomNav";
import Icon from "../components/Icon";
import ToggleSwitch from "../components/ToggleSwitch";
import { useSoilFlow } from "../context/SoilFlowContext";
import { scheduleOptions } from "../data/plants";

function buildDraft(plantId, scheduleLabel = scheduleOptions[0]) {
  return {
    name: "New Automation",
    plantId,
    triggerBelow: 35,
    durationSeconds: 30,
    scheduleLabel,
    summary: "Sensor-driven watering rule.",
    enabled: true,
  };
}

export default function AutomationsPage({ onNotify }) {
  const { automations, deleteAutomation, plants, runAutomationNow, saveAutomation, toggleAutomation } =
    useSoilFlow();
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState(buildDraft(plants[0]?.id ?? ""));

  useEffect(() => {
    document.title = "SoilFlow | Automations";
  }, []);

  useEffect(() => {
    if (!draft.plantId && plants[0]) {
      setDraft(buildDraft(plants[0].id));
    }
  }, [draft.plantId, plants]);

  const activeCount = useMemo(() => {
    return automations.filter((automation) => automation.enabled).length;
  }, [automations]);

  const averageDuration = useMemo(() => {
    if (!automations.length) {
      return 0;
    }

    return Math.round(
      automations.reduce((total, automation) => total + automation.durationSeconds, 0) /
        automations.length,
    );
  }, [automations]);

  const startCreate = () => {
    setDraft(buildDraft(plants[0]?.id ?? ""));
    setComposerOpen(true);
  };

  const startEdit = (automation) => {
    setDraft({ ...automation });
    setComposerOpen(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    saveAutomation(draft);
    onNotify(draft.id ? `${draft.name} updated.` : `${draft.name} created.`);
    setComposerOpen(false);
    setDraft(buildDraft(plants[0]?.id ?? ""));
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24 font-sans text-foreground">
      <header className="flex items-center justify-between px-5 pt-8 pb-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Automations
          </h1>
          <p className="text-sm text-muted-foreground">
            Build stateful watering rules before hardware comes online
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          aria-label="Add automation"
        >
          <Icon icon="hugeicons:add-01" className="size-6" />
        </button>
      </header>

      <main className="flex flex-1 flex-col gap-6 px-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-3xl border border-border bg-card p-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Active Rules
            </span>
            <p className="mt-2 text-2xl font-bold text-primary">{activeCount}</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Avg Duration
            </span>
            <p className="mt-2 text-2xl font-bold text-foreground">{averageDuration}s</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Rules Total
            </span>
            <p className="mt-2 text-2xl font-bold text-foreground">{automations.length}</p>
          </div>
        </div>

        {composerOpen ? (
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-border bg-card p-5 shadow-lg shadow-black/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  {draft.id ? "Edit Rule" : "New Rule"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Configure a mock schedule, threshold, and duration
                </p>
              </div>
              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Cancel
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-foreground">Rule Name</span>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      name: event.target.value,
                    }))
                  }
                  className="rounded-2xl border border-border bg-background/60 px-4 py-3 text-foreground outline-none transition focus:border-primary/60"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-foreground">Plant</span>
                <select
                  value={draft.plantId}
                  onChange={(event) =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      plantId: event.target.value,
                    }))
                  }
                  className="rounded-2xl border border-border bg-background/60 px-4 py-3 text-foreground outline-none transition focus:border-primary/60"
                >
                  {plants.map((plant) => (
                    <option key={plant.id} value={plant.id}>
                      {plant.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-foreground">Schedule</span>
                <select
                  value={draft.scheduleLabel}
                  onChange={(event) =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      scheduleLabel: event.target.value,
                    }))
                  }
                  className="rounded-2xl border border-border bg-background/60 px-4 py-3 text-foreground outline-none transition focus:border-primary/60"
                >
                  {scheduleOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-foreground">
                  Trigger Below {draft.triggerBelow}%
                </span>
                <input
                  type="range"
                  min="10"
                  max="70"
                  value={draft.triggerBelow}
                  onChange={(event) =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      triggerBelow: Number(event.target.value),
                    }))
                  }
                  className="accent-primary"
                />
              </div>

              <div className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-foreground">
                  Duration {draft.durationSeconds}s
                </span>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={draft.durationSeconds}
                  onChange={(event) =>
                    setDraft((currentDraft) => ({
                      ...currentDraft,
                      durationSeconds: Number(event.target.value),
                    }))
                  }
                  className="accent-primary"
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-border bg-background/40 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Rule Enabled</p>
                  <p className="text-xs text-muted-foreground">Keep this automation armed</p>
                </div>
                <ToggleSwitch
                  checked={draft.enabled}
                  onChange={(checked) =>
                    setDraft((currentDraft) => ({ ...currentDraft, enabled: checked }))
                  }
                  label="Enable automation draft"
                />
              </div>
            </div>

            <label className="mt-4 flex flex-col gap-2 text-sm">
              <span className="font-medium text-foreground">Summary</span>
              <textarea
                value={draft.summary}
                onChange={(event) =>
                  setDraft((currentDraft) => ({
                    ...currentDraft,
                    summary: event.target.value,
                  }))
                }
                rows="3"
                className="rounded-2xl border border-border bg-background/60 px-4 py-3 text-foreground outline-none transition focus:border-primary/60"
              ></textarea>
            </label>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                className="rounded-full bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              >
                Save Rule
              </button>
            </div>
          </form>
        ) : null}

        <div className="flex flex-col gap-4">
          {automations.length ? (
            automations.map((automation) => {
              const linkedPlant = plants.find((plant) => plant.id === automation.plantId);

              return (
                <div
                  key={automation.id}
                  className="rounded-3xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading text-lg font-semibold text-foreground">
                          {automation.name}
                        </h3>
                        <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {linkedPlant?.channelLabel}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {linkedPlant?.name} &bull; {automation.summary}
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={automation.enabled}
                      onChange={() => {
                        toggleAutomation(automation.id);
                        onNotify(
                          automation.enabled
                            ? `${automation.name} paused.`
                            : `${automation.name} re-armed.`,
                        );
                      }}
                      label={`Toggle ${automation.name}`}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-border bg-background/40 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Trigger
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        Below {automation.triggerBelow}%
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background/40 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Duration
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {automation.durationSeconds}s
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background/40 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Next Run
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {automation.nextRunLabel}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground">
                      {automation.scheduleLabel} &bull; Last run {automation.lastRunText}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          runAutomationNow(automation.id);
                          onNotify(`${automation.name} ran for ${linkedPlant?.name}.`);
                        }}
                        className="rounded-full bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                      >
                        Run Now
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(automation)}
                        className="rounded-full bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteAutomation(automation.id);
                          onNotify(`${automation.name} deleted.`);
                        }}
                        className="rounded-full bg-accent/10 px-3 py-2 text-xs font-semibold text-accent transition-colors hover:bg-accent/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-card/60 p-5 text-sm text-muted-foreground">
              No automations yet. Use the add button to create the first mock rule.
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
