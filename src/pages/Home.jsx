import React from "react";
import Icon from "../components/Icon";
import {
  formatRelativeTime,
  formatTimeLabel,
  getAutomationPlantIds,
  getNearestActiveAutomation,
  getPlantStatus,
  getPlantStatusMeta,
} from "../utils/soilFlowState";

function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}...`;
}

export default function Home({ plants, automations, onNavigate }) {
  const recentPlants = plants.slice(0, 3);
  const dryPlants = plants.filter((plant) => getPlantStatus(plant.moisture) === "dry").length;
  const activeAutomations = automations.filter((automation) => automation.isActive !== false);
  const nextAutomation = getNearestActiveAutomation(activeAutomations);
  const nextAutomationPlantNames = nextAutomation
    ? getAutomationPlantIds(nextAutomation)
        .map((plantId) => plants.find((plant) => plant.id === plantId)?.name)
        .filter(Boolean)
    : [];

  const nextCycleSummary = nextAutomation
    ? formatTimeLabel(nextAutomation.time)
    : "No upcoming cycle";
  const nextCycleAutomationName = nextAutomation ? nextAutomation.name : "No active automations";
  const nextCyclePlants = nextAutomation
    ? nextAutomationPlantNames.length
      ? nextAutomationPlantNames.join(", ")
      : "No plants linked yet"
    : "No active plant group";
  const nextCycleStatus = nextAutomation ? "Scheduled" : "Inactive";

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      <div className="mobile-card relative overflow-hidden rounded-[1.25rem] border border-border bg-gradient-to-br from-secondary to-card p-4 shadow-md sm:p-5">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative z-10 flex flex-col gap-4">
          <div>
            <p className="mb-1 flex items-center gap-2 text-sm font-medium text-secondary-foreground">
              <Icon icon="solar:clock-circle-linear" className="size-4" />
              Next Scheduled Cycle
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              {nextCycleSummary}
            </h2>
            <p className="mt-1 break-words text-xs text-muted-foreground">{nextCycleAutomationName}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1rem] border border-border/80 bg-background/70 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Plants</p>
              <p className="mt-2 break-words text-sm font-semibold text-foreground">{nextCyclePlants}</p>
            </div>
            <div className="rounded-[1rem] border border-border/80 bg-background/70 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Status</p>
              <p className="mt-2 text-sm font-semibold text-foreground">{nextCycleStatus}</p>
            </div>
            <div className="rounded-[1rem] border border-border/80 bg-background/70 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Weather</p>
              <p className="mt-2 text-sm font-semibold text-foreground">Partly cloudy</p>
            </div>
            <div className="rounded-[1rem] border border-border/80 bg-background/70 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Temperature</p>
              <p className="mt-2 text-sm font-semibold text-foreground">28 C</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="mobile-card rounded-[1.25rem] border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Overview</p>
              <h3 className="font-heading text-lg font-semibold text-foreground">Plant Summary</h3>
            </div>
            <span className="self-start rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {plants.length} Active
            </span>
          </div>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-[1rem] bg-background px-4 py-3">
              <span>Plants tracked</span>
              <span className="font-semibold text-foreground">{plants.length}/8</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-[1rem] bg-background px-4 py-3">
              <span>Active automations</span>
              <span className="font-semibold text-foreground">{activeAutomations.length}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-[1rem] bg-background px-4 py-3">
              <span>Recommended action</span>
              <span className="break-words text-right font-semibold text-foreground">
                {dryPlants ? `${dryPlants} plant${dryPlants === 1 ? "" : "s"} need water` : "All plants look steady"}
              </span>
            </div>
          </div>
        </div>

        <div className="mobile-card rounded-[1.25rem] border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Quick Access</p>
              <h3 className="font-heading text-lg font-semibold text-foreground">Plant Manager</h3>
            </div>
            <Icon icon="solar:leaf-bold" className="size-5 text-primary" />
          </div>
          <p className="mb-4 text-sm leading-6 text-muted-foreground">
            Open the dedicated plant workspace to add, update, water, and review every monitored plant in one focused place.
          </p>
          <button
            type="button"
            onClick={() => onNavigate("plants")}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <Icon icon="hugeicons:add-01" className="size-4" />
            <span>Manage Plants</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="font-heading text-lg font-semibold text-foreground tracking-tight">
              Recent Plants
            </h3>
            <p className="text-xs text-muted-foreground">A quick look at your monitored collection</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("plants")}
            className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            View all
          </button>
        </div>

        {recentPlants.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {recentPlants.map((plant) => {
              const statusMeta = getPlantStatusMeta(plant.moisture);

              return (
                <button
                  key={plant.id}
                  type="button"
                  onClick={() => onNavigate("plants")}
                  className="mobile-card flex items-center gap-4 rounded-[1.25rem] border border-border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99]"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border/50">
                    <img src={plant.image} alt={plant.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                      <h4 className="truncate font-heading text-base font-semibold text-foreground">
                        {plant.name}
                      </h4>
                      <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusMeta.badgeClass}`}>
                        <span className={`h-2 w-2 rounded-full ${statusMeta.dotClass}`} />
                        {statusMeta.shortLabel}
                      </span>
                    </div>
                    <p className="text-xs leading-5 text-muted-foreground">
                      {truncateText(plant.desc, 72)}
                    </p>
                    <p className="mt-2 break-words text-[11px] font-medium text-muted-foreground">
                      Moisture {plant.moisture}% - Watered {formatRelativeTime(plant.lastWateredAt)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[1.25rem] border border-dashed border-border bg-card/70 p-5 text-center text-sm text-muted-foreground">
            <div className="flex flex-col items-center gap-3">
              <Icon icon="solar:leaf-linear" className="size-8 text-primary/50" />
              <p>No plants saved yet. Start by adding one in the Plants page.</p>
              <button
                type="button"
                onClick={() => onNavigate("plants")}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
              >
                <Icon icon="hugeicons:add-01" className="size-4" />
                <span>Open Plants</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
