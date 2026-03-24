import { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";
import HomePlantCard from "../components/HomePlantCard";
import Icon from "../components/Icon";
import { useSoilFlow } from "../context/SoilFlowContext";

export default function HomePage({ onNotify }) {
  const { plants, runAutomationNow, system, upcomingCycles } = useSoilFlow();
  const [cyclePanelOpen, setCyclePanelOpen] = useState(true);

  useEffect(() => {
    document.title = "SoilFlow | Home";
  }, []);

  const nextCycle = upcomingCycles[0];

  const handleCycleToggle = () => {
    if (!nextCycle) {
      onNotify("Enable an automation rule to queue the next watering cycle.");
      return;
    }

    runAutomationNow(nextCycle.id);
    onNotify(`${nextCycle.name} started for ${nextCycle.plant.name}.`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24 font-sans text-foreground">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/80 px-5 py-3 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Icon icon="solar:droplet-minimalistic-bold" className="size-5 text-primary" />
          <span className="font-heading text-base font-semibold tracking-tight text-primary">
            SoilFlow
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-1.5" title="Pump Status">
            <Icon icon="material-symbols:water-pump-rounded" className="size-4 text-foreground" />
            <span>{system.pumpStatus}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Reservoir Level">
            <Icon icon="solar:waterdrops-bold" className="size-4 text-chart-3" />
            <span>{system.reservoirLevel}%</span>
          </div>
          <div className="flex items-center gap-1.5" title="Wi-Fi Signal">
            <Icon icon="solar:wi-fi-bold" className="size-4 text-primary" />
            <span>{system.wifiStatus}</span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 px-5 pt-6">
        <div className="relative overflow-hidden rounded-[1.25rem] border border-border bg-gradient-to-br from-secondary to-card p-5 shadow-md">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="mb-1 flex items-center gap-2 text-sm font-medium text-secondary-foreground">
                <Icon icon="solar:clock-circle-linear" className="size-4" />
                Next Scheduled Cycle
              </p>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                {nextCycle?.countdownLabel ?? "No rules"}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {nextCycle
                  ? `${nextCycle.name} • ${nextCycle.plant.name}`
                  : "No enabled automations yet"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCycleToggle}
              aria-pressed={system.pumpStatus === "Running"}
              className="flex items-center justify-center rounded-full bg-primary/10 p-3 text-primary transition-all hover:scale-105 hover:bg-primary/20 active:scale-95"
            >
              <Icon icon="solar:play-circle-bold" className="size-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
              Upcoming Cycles
            </h3>
            <button
              type="button"
              onClick={() => setCyclePanelOpen((currentState) => !currentState)}
              className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {cyclePanelOpen ? "Hide" : "Show"}
            </button>
          </div>
          {cyclePanelOpen ? (
            <div className="flex flex-col gap-3">
              {upcomingCycles.length ? (
                upcomingCycles.map((cycle) => (
                  <button
                    key={cycle.id}
                    type="button"
                    onClick={() => {
                      runAutomationNow(cycle.id);
                      onNotify(`${cycle.name} ran for ${cycle.plant.name}.`);
                    }}
                    className="w-full rounded-3xl border border-border bg-card p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{cycle.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {cycle.plant.name} &bull; {cycle.scheduleLabel}
                        </p>
                      </div>
                      <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {cycle.countdownLabel}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <p className="text-xs text-muted-foreground">{cycle.summary}</p>
                      <span className="text-xs font-semibold text-primary">Run now</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-border bg-card/60 p-5 text-sm text-muted-foreground">
                  No automation rules are enabled. Head to Automations to queue one.
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
              Monitored Plants
            </h3>
            <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
              {plants.length} Active
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {plants.map((plant) => (
              <HomePlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
