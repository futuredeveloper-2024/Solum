import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  decoratePlants,
  initialAutomations,
  initialPlants,
  initialSettings,
} from "../data/plants";

const SoilFlowContext = createContext(null);

function buildManualActivity(title, wasDry) {
  return {
    title,
    date: "Just now",
    duration: `${wasDry ? 45 : 20}s duration`,
    icon: "material-symbols:water-pump-rounded",
    iconWrapperClass: "bg-primary/10 text-primary",
  };
}

function buildDemoPlant(nextChannel, image) {
  return {
    id: `demo-${Date.now()}`,
    name: "Starter Cutting",
    fullName: "Epipremnum Trial",
    channelLabel: `CH ${nextChannel}`,
    channelName: `Channel ${nextChannel}`,
    image,
    heroImage: image,
    moisture: 54,
    threshold: 40,
    healthScore: 88,
    growthStage: "Starter Rooting",
    growthNote: "Fresh propagation test placed in indirect light.",
    lastWateredText: "Yesterday",
    lastWateredShort: "1d",
    lastCheckText: "Just now",
    wateringWindow: "Tomorrow • 10:15 AM",
    note: "New mock plant added for flow testing.",
    activities: [
      {
        title: "Imported Mock Sensor",
        date: "Just now",
        duration: "Ready",
        icon: "solar:check-circle-bold",
        iconWrapperClass: "bg-primary/10 text-primary",
      },
    ],
    history: [48, 50, 52, 55, 58, 57, 54],
  };
}

export function SoilFlowProvider({ children }) {
  const [plants, setPlants] = useState(initialPlants);
  const [automations, setAutomations] = useState(initialAutomations);
  const [settings, setSettings] = useState(initialSettings);
  const [system, setSystem] = useState({
    pumpStatus: "Idle",
    reservoirLevel: 72,
    wifiStatus: "Stable",
    activeCycleLabel: "System Monitoring",
  });

  useEffect(() => {
    if (system.pumpStatus !== "Running") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setSystem((currentSystem) => ({
        ...currentSystem,
        pumpStatus: "Idle",
      }));
    }, 1800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [system.pumpStatus]);

  const decoratedPlants = useMemo(() => decoratePlants(plants), [plants]);

  const plantsById = useMemo(() => {
    return Object.fromEntries(decoratedPlants.map((plant) => [plant.id, plant]));
  }, [decoratedPlants]);

  const upcomingCycles = useMemo(() => {
    return automations
      .filter((automation) => automation.enabled)
      .sort((left, right) => left.order - right.order)
      .map((automation) => ({
        ...automation,
        plant: plantsById[automation.plantId],
      }));
  }, [automations, plantsById]);

  const startWateringNow = (plantId, cycleLabel = "Manual Watering") => {
    setPlants((currentPlants) =>
      currentPlants.map((plant) => {
        if (plant.id !== plantId) {
          return plant;
        }

        const wasDry = plant.moisture <= plant.threshold - 5;
        const nextMoisture = Math.min(96, plant.moisture + (wasDry ? 24 : 12));
        const nextHealthScore = Math.min(99, plant.healthScore + (wasDry ? 2 : 1));

        return {
          ...plant,
          moisture: nextMoisture,
          healthScore: nextHealthScore,
          lastWateredText: "Just now",
          lastWateredShort: "0d",
          lastCheckText: "Just now",
          history: [...plant.history.slice(0, -1), nextMoisture],
          activities: [buildManualActivity(cycleLabel, wasDry), ...plant.activities].slice(0, 4),
        };
      }),
    );

    setSystem((currentSystem) => ({
      ...currentSystem,
      pumpStatus: "Running",
      reservoirLevel: Math.max(10, currentSystem.reservoirLevel - 4),
      activeCycleLabel: cycleLabel,
    }));
  };

  const updatePlantThreshold = (plantId, threshold) => {
    const nextThreshold = Number(threshold);

    setPlants((currentPlants) =>
      currentPlants.map((plant) =>
        plant.id === plantId ? { ...plant, threshold: nextThreshold } : plant,
      ),
    );

    setAutomations((currentAutomations) =>
      currentAutomations.map((automation) =>
        automation.plantId === plantId
          ? { ...automation, triggerBelow: nextThreshold }
          : automation,
      ),
    );
  };

  const runAutomationNow = (automationId) => {
    const automation = automations.find((rule) => rule.id === automationId);

    if (!automation) {
      return;
    }

    startWateringNow(automation.plantId, automation.name);

    setAutomations((currentAutomations) =>
      currentAutomations.map((rule) =>
        rule.id === automationId
          ? {
              ...rule,
              lastRunText: "Just now",
              countdownLabel: "Queued again",
              nextRunLabel:
                rule.scheduleLabel === "Daily • 7:30 PM"
                  ? "Tomorrow • 7:30 PM"
                  : rule.nextRunLabel,
            }
          : rule,
      ),
    );
  };

  const saveAutomation = (draft) => {
    const normalizedDraft = {
      ...draft,
      triggerBelow: Number(draft.triggerBelow),
      durationSeconds: Number(draft.durationSeconds),
      enabled: draft.enabled ?? true,
    };

    setAutomations((currentAutomations) => {
      if (normalizedDraft.id) {
        return currentAutomations.map((automation) =>
          automation.id === normalizedDraft.id
            ? { ...automation, ...normalizedDraft }
            : automation,
        );
      }

      return [
        {
          ...normalizedDraft,
          id: `auto-${Date.now()}`,
          order: currentAutomations.length + 1,
          countdownLabel: "Queued",
          nextRunLabel: normalizedDraft.scheduleLabel,
          lastRunText: "Not yet",
        },
        ...currentAutomations,
      ];
    });
  };

  const deleteAutomation = (automationId) => {
    setAutomations((currentAutomations) =>
      currentAutomations.filter((automation) => automation.id !== automationId),
    );
  };

  const toggleAutomation = (automationId) => {
    setAutomations((currentAutomations) =>
      currentAutomations.map((automation) =>
        automation.id === automationId
          ? { ...automation, enabled: !automation.enabled }
          : automation,
      ),
    );
  };

  const addDemoPlant = () => {
    const nextChannel = plants.length + 1;
    const templateImage = plants[plants.length - 1]?.image ?? plants[0].image;

    setPlants((currentPlants) => [...currentPlants, buildDemoPlant(nextChannel, templateImage)]);
  };

  const updateSettings = (updates) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      ...updates,
    }));
  };

  const value = useMemo(
    () => ({
      plants: decoratedPlants,
      plantsById,
      automations,
      settings,
      system,
      upcomingCycles,
      startWateringNow,
      updatePlantThreshold,
      runAutomationNow,
      saveAutomation,
      deleteAutomation,
      toggleAutomation,
      updateSettings,
      addDemoPlant,
    }),
    [decoratedPlants, plantsById, automations, settings, system, upcomingCycles],
  );

  return <SoilFlowContext.Provider value={value}>{children}</SoilFlowContext.Provider>;
}

export function useSoilFlow() {
  const context = useContext(SoilFlowContext);

  if (!context) {
    throw new Error("useSoilFlow must be used inside SoilFlowProvider.");
  }

  return context;
}
