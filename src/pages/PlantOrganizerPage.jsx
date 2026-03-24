import { useEffect, useMemo, useState } from "react";
import BottomNav from "../components/BottomNav";
import Icon from "../components/Icon";
import OrganizerPlantCard from "../components/OrganizerPlantCard";
import { useSoilFlow } from "../context/SoilFlowContext";

export default function PlantOrganizerPage({ onNotify }) {
  const { addDemoPlant, plants, startWateringNow } = useSoilFlow();
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    document.title = "SoilFlow | Plants";
  }, []);

  const averageHealth = useMemo(() => {
    return Math.round(
      plants.reduce((total, plant) => total + plant.healthScore, 0) / plants.length,
    );
  }, [plants]);

  const filteredPlants = useMemo(() => {
    if (activeFilter === "all") {
      return plants;
    }

    return plants.filter((plant) => {
      if (activeFilter === "dry") {
        return plant.homeStatus.label === "Dry";
      }

      if (activeFilter === "healthy") {
        return plant.homeStatus.label === "OK";
      }

      return plant.homeStatus.label === "Wet";
    });
  }, [activeFilter, plants]);

  const filterOptions = [
    { id: "all", label: "All" },
    { id: "dry", label: "Needs Water" },
    { id: "healthy", label: "Healthy" },
    { id: "wet", label: "Wet" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24 font-sans text-foreground">
      <header className="flex items-center justify-between px-5 pt-8 pb-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
            Your Garden
          </h1>
          <p className="text-sm text-muted-foreground">Manage sensors and channels</p>
        </div>
        <button
          type="button"
          onClick={() => {
            addDemoPlant();
            onNotify("Starter Cutting added to the mock garden.");
          }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          aria-label="Add plant"
        >
          <Icon icon="hugeicons:add-01" className="size-6" />
        </button>
      </header>

      <main className="flex flex-1 flex-col gap-6 px-5">
        <div className="flex items-center gap-4 rounded-3xl border border-border bg-secondary/40 p-4">
          <div className="flex flex-1 flex-col gap-1 border-r border-border">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Total Plants
            </span>
            <span className="text-xl font-bold">{plants.length.toString().padStart(2, "0")}</span>
          </div>
          <div className="flex flex-1 flex-col gap-1 border-r border-border">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Avg Health
            </span>
            <span className="text-xl font-bold text-primary">{averageHealth}%</span>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Channels
            </span>
            <span className="text-xl font-bold">{plants.length}/8</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setActiveFilter(option.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeFilter === option.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {filteredPlants.map((plant) => (
            <OrganizerPlantCard
              key={plant.id}
              plant={plant}
              onMenu={(selectedPlant) => {
                startWateringNow(selectedPlant.id, `${selectedPlant.name} Quick Water`);
                onNotify(`${selectedPlant.name} watered from the organizer list.`);
              }}
            />
          ))}

          <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-6 text-center text-muted-foreground">
            <Icon icon="solar:reorder-linear" className="size-8 opacity-20" />
            <p className="text-sm italic">Filter plants above or quick-water from the menu</p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
