import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Icon from "../components/Icon";
import { useSoilFlow } from "../context/SoilFlowContext";

export default function PlantDetailPage({ onNotify }) {
  const navigate = useNavigate();
  const { plantId } = useParams();
  const { plantsById, startWateringNow, updatePlantThreshold } = useSoilFlow();
  const plant = useMemo(() => plantsById[plantId] ?? plantsById.monstera, [plantId, plantsById]);
  const [threshold, setThreshold] = useState(plant.threshold);

  useEffect(() => {
    document.title = `${plant.name} | SoilFlow`;
  }, [plant]);

  useEffect(() => {
    setThreshold(plant.threshold);
  }, [plant.threshold]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/plants");
  };

  const handleWatering = () => {
    startWateringNow(plant.id, `${plant.name} Manual Cycle`);
    onNotify(`${plant.name} watering cycle started.`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-10 font-sans text-foreground">
      <div className="relative h-72 w-full overflow-hidden">
        <img
          src={plant.heroImage}
          alt={`${plant.fullName} hero`}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        <div className="absolute top-6 left-5 right-5 z-10 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-full border border-white/10 bg-black/30 p-2.5 text-white backdrop-blur-md"
            aria-label="Go back"
          >
            <Icon icon="solar:alt-arrow-left-linear" className="size-6" />
          </button>
          <button
            type="button"
            onClick={() => onNotify(`Edit controls for ${plant.name} are ready for integration.`)}
            className="rounded-full border border-white/10 bg-black/30 p-2.5 text-white backdrop-blur-md"
            aria-label={`Edit ${plant.name}`}
          >
            <Icon icon="solar:pen-new-square-linear" className="size-6" />
          </button>
        </div>
        <div className="absolute bottom-6 left-5 right-5">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-white">
            {plant.name}
          </h1>
          <p className="text-sm italic text-white/70">
            {plant.fullName} &bull; {plant.channelName}
          </p>
        </div>
      </div>

      <main className="relative z-10 -mt-2 flex flex-col gap-8 px-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-card p-3 text-center">
            <Icon icon="solar:droplet-bold" className={`size-5 ${plant.moistureToneClass}`} />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Moisture
            </span>
            <span className="text-lg font-bold">{plant.moisture}%</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-card p-3 text-center">
            <Icon icon="solar:star-bold" className="size-5 text-chart-1" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Health
            </span>
            <span className="text-lg font-bold">{plant.health}</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-card p-3 text-center">
            <Icon icon="solar:calendar-bold" className="size-5 text-chart-3" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Watered
            </span>
            <span className="text-lg font-bold">{plant.detailWatered}</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-card p-3 text-center">
            <Icon icon="solar:leaf-bold" className="size-5 text-primary" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Growth
            </span>
            <span className="text-lg font-bold">{plant.growthStage}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
              Moisture History
            </h3>
            <span className="text-xs text-muted-foreground">Last 7 Days</span>
          </div>
          <div className="relative flex h-48 items-end justify-between gap-1 rounded-3xl border border-border bg-card p-6">
            {plant.historyBars.map((bar, index) => {
              const isCurrentDay = index === plant.historyBars.length - 1;

              return (
                <div
                  key={`${bar.label}-${index}`}
                  className="flex h-full flex-1 flex-col justify-end gap-2"
                >
                  <div className="relative h-full w-full rounded-t-md bg-muted/70">
                    <div
                      className={`absolute inset-x-0 bottom-0 rounded-t-md ${bar.fillClass}`}
                      style={{ height: `${bar.value}%` }}
                    ></div>
                  </div>
                  <span
                    className={`text-center text-[10px] ${
                      isCurrentDay
                        ? `font-bold ${plant.historyHighlightClass}`
                        : "text-muted-foreground"
                    }`}
                  >
                    {bar.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-3xl border border-border bg-secondary/40 p-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Auto-Watering Threshold</span>
              <span className="text-xs text-muted-foreground">
                Pump activates when moisture &lt; {threshold}%
              </span>
            </div>
            <span className="text-xl font-bold text-primary">{threshold}%</span>
          </div>
          <div className="relative h-5 w-full">
            <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-muted"></div>
            <div
              className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary"
              style={{ width: `${threshold}%` }}
            ></div>
            <div
              className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-white shadow-md"
              style={{ left: `${threshold}%` }}
            ></div>
            <input
              type="range"
              min="10"
              max="80"
              step="1"
              value={threshold}
              onChange={(event) => {
                const nextThreshold = Number(event.target.value);
                setThreshold(nextThreshold);
                updatePlantThreshold(plant.id, nextThreshold);
              }}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Set auto-watering moisture threshold"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-heading text-lg font-semibold text-foreground">
                Growth Snapshot
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{plant.growthNote}</p>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              {plant.wateringWindow}
            </span>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">{plant.note}</p>
        </div>

        <button
          type="button"
          onClick={handleWatering}
          className="flex w-full items-center justify-center gap-3 rounded-[1.25rem] bg-primary py-5 font-heading text-lg font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-95"
        >
          <Icon icon="material-symbols:water-pump-rounded" className="size-6" />
          Start Watering Now
        </button>

        <div className="flex flex-col gap-4">
          <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
            Recent Activity
          </h3>
          <div className="flex flex-col gap-3">
            {plant.activities.map((activity) => (
              <div
                key={`${plant.id}-${activity.title}`}
                className="flex items-center justify-between rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${activity.iconWrapperClass}`}
                  >
                    <Icon icon={activity.icon} className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-primary">{activity.duration}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
