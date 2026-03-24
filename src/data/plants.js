import monsteraImage from "../assets/images/igHOUVxWvZG.png";
import rubberTreeImage from "../assets/images/4Csh5SK28xc.png";
import neonPothosImage from "../assets/images/yIZ7dXgYOFI.png";

const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

const tonePresets = {
  healthy: {
    icon: "solar:check-circle-bold",
    homeLabel: "OK",
    badgeClass: "bg-primary/10 text-primary",
    cardClass:
      "bg-card rounded-[1.25rem] border border-border p-4 flex gap-4 items-center shadow-sm relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99]",
    overlayClass: "",
    organizerStatus: "Healthy",
    organizerIndicatorClass: "bg-primary animate-pulse",
    moistureLabel: "Optimal",
    moistureLabelClass: "text-foreground font-medium",
    moistureToneClass: "text-primary",
    historyFillClass: "bg-primary/40",
    historyCurrentFillClass: "bg-primary",
    historyHighlightClass: "text-primary",
  },
  dry: {
    icon: "solar:danger-triangle-bold",
    homeLabel: "Dry",
    badgeClass: "bg-accent/10 text-accent",
    cardClass:
      "bg-card rounded-[1.25rem] border border-accent/30 p-4 flex gap-4 items-center shadow-sm relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/10 active:scale-[0.99]",
    overlayClass: "absolute inset-0 bg-accent/5 pointer-events-none",
    organizerStatus: "Needs Water",
    organizerIndicatorClass: "bg-accent animate-pulse",
    moistureLabel: "Critical",
    moistureLabelClass: "text-accent font-medium",
    moistureToneClass: "text-accent",
    historyFillClass: "bg-accent/40",
    historyCurrentFillClass: "bg-accent",
    historyHighlightClass: "text-accent",
  },
  wet: {
    icon: "solar:waterdrops-bold",
    homeLabel: "Wet",
    badgeClass: "bg-chart-3/10 text-chart-3",
    cardClass:
      "bg-card rounded-[1.25rem] border border-border p-4 flex gap-4 items-center shadow-sm relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-chart-3/10 active:scale-[0.99]",
    overlayClass: "",
    organizerStatus: "Saturated",
    organizerIndicatorClass: "bg-chart-3",
    moistureLabel: "Saturated",
    moistureLabelClass: "text-foreground font-medium",
    moistureToneClass: "text-chart-3",
    historyFillClass: "bg-chart-3/40",
    historyCurrentFillClass: "bg-chart-3",
    historyHighlightClass: "text-chart-3",
  },
};

function buildHistoryBars(history, preset) {
  return history.map((value, index) => ({
    label: dayLabels[index] ?? "",
    value,
    fillClass:
      index === history.length - 1 ? preset.historyCurrentFillClass : preset.historyFillClass,
  }));
}

export function getHealthLabel(healthScore) {
  if (healthScore >= 96) {
    return "Peak";
  }

  if (healthScore >= 92) {
    return "Thriving";
  }

  if (healthScore >= 84) {
    return "Stable";
  }

  return "Watch";
}

export function getPlantCondition(plant) {
  if (plant.moisture <= plant.threshold - 5) {
    return "dry";
  }

  if (plant.moisture >= plant.threshold + 40) {
    return "wet";
  }

  return "healthy";
}

export function decoratePlant(plant) {
  const preset = tonePresets[getPlantCondition(plant)];

  return {
    ...plant,
    wateredAgo: plant.lastWateredText,
    detailWatered: plant.lastWateredShort,
    health: getHealthLabel(plant.healthScore),
    homeStatus: {
      label: preset.homeLabel,
      icon: preset.icon,
      containerClass: preset.badgeClass,
    },
    homeCardClass: preset.cardClass,
    homeOverlayClass: preset.overlayClass,
    organizerStatus: preset.organizerStatus,
    organizerLastCheck: plant.lastCheckText,
    organizerIndicatorClass: preset.organizerIndicatorClass,
    moistureLabel: preset.moistureLabel,
    moistureLabelClass: preset.moistureLabelClass,
    moistureToneClass: preset.moistureToneClass,
    historyBars: buildHistoryBars(plant.history, preset),
    historyHighlightClass: preset.historyHighlightClass,
  };
}

export function decoratePlants(plants) {
  return plants.map(decoratePlant);
}

export const initialPlants = [
  {
    id: "monstera",
    name: "Monstera",
    fullName: "Monstera Deliciosa",
    channelLabel: "CH 1",
    channelName: "Channel 1",
    image: monsteraImage,
    heroImage: monsteraImage,
    moisture: 62,
    threshold: 35,
    healthScore: 97,
    growthStage: "Mature Climber",
    growthNote: "Newest leaf is unfurling with strong fenestration.",
    lastWateredText: "3d ago",
    lastWateredShort: "3d",
    lastCheckText: "2m ago",
    wateringWindow: "Tomorrow • 7:00 AM",
    note: "South window shelf with bright indirect light.",
    activities: [
      {
        title: "Auto-Watering Cycle",
        date: "Oct 24, 08:30 PM",
        duration: "45s duration",
        icon: "solar:droplet-bold",
        iconWrapperClass: "bg-primary/10 text-primary",
      },
      {
        title: "Manual Override",
        date: "Oct 21, 09:15 AM",
        duration: "15s duration",
        icon: "solar:user-bold",
        iconWrapperClass: "bg-secondary text-secondary-foreground",
      },
    ],
    history: [80, 70, 65, 50, 40, 85, 62],
  },
  {
    id: "rubber-tree",
    name: "Rubber Tree",
    fullName: "Ficus Elastica",
    channelLabel: "CH 2",
    channelName: "Channel 2",
    image: rubberTreeImage,
    heroImage: rubberTreeImage,
    moisture: 18,
    threshold: 35,
    healthScore: 90,
    growthStage: "Recovery Phase",
    growthNote: "Lower leaves are curling slightly from a drier root ball.",
    lastWateredText: "8d ago",
    lastWateredShort: "8d",
    lastCheckText: "5m ago",
    wateringWindow: "Today • 7:30 PM",
    note: "Prioritized for the next rescue cycle.",
    activities: [
      {
        title: "Dry Soil Alert",
        date: "Oct 24, 07:05 PM",
        duration: "Triggered now",
        icon: "solar:danger-triangle-bold",
        iconWrapperClass: "bg-accent/10 text-accent",
      },
      {
        title: "Last Watering",
        date: "Oct 16, 08:00 AM",
        duration: "30s duration",
        icon: "material-symbols:water-pump-rounded",
        iconWrapperClass: "bg-secondary text-secondary-foreground",
      },
    ],
    history: [35, 32, 28, 25, 22, 20, 18],
  },
  {
    id: "neon-pothos",
    name: "Neon Pothos",
    fullName: "Epipremnum aureum",
    channelLabel: "CH 3",
    channelName: "Channel 3",
    image: neonPothosImage,
    heroImage: neonPothosImage,
    moisture: 88,
    threshold: 30,
    healthScore: 95,
    growthStage: "Trailing Dense",
    growthNote: "Moisture is high after a recent top-up, leaves still glossy.",
    lastWateredText: "Just now",
    lastWateredShort: "0d",
    lastCheckText: "1m ago",
    wateringWindow: "Tonight • 11:45 PM",
    note: "Drainage check scheduled before the next cycle.",
    activities: [
      {
        title: "Reservoir Top-Up",
        date: "Oct 24, 08:45 PM",
        duration: "1m duration",
        icon: "solar:waterdrops-bold",
        iconWrapperClass: "bg-chart-3/10 text-chart-3",
      },
      {
        title: "Sensor Sync",
        date: "Oct 24, 08:35 PM",
        duration: "Completed",
        icon: "solar:check-circle-bold",
        iconWrapperClass: "bg-secondary text-secondary-foreground",
      },
    ],
    history: [78, 82, 85, 90, 88, 91, 88],
  },
];

export const initialAutomations = [
  {
    id: "evening-rescue",
    name: "Evening Rescue",
    plantId: "rubber-tree",
    triggerBelow: 35,
    durationSeconds: 45,
    scheduleLabel: "Daily • 7:30 PM",
    nextRunLabel: "Today • 7:30 PM",
    countdownLabel: "2h 45m",
    summary: "Sunset recovery cycle for the driest channel.",
    cadenceLabel: "Daily",
    enabled: true,
    order: 1,
    lastRunText: "Yesterday • 7:28 PM",
  },
  {
    id: "morning-balance",
    name: "Morning Balance",
    plantId: "monstera",
    triggerBelow: 35,
    durationSeconds: 30,
    scheduleLabel: "Weekdays • 7:00 AM",
    nextRunLabel: "Tomorrow • 7:00 AM",
    countdownLabel: "11h 15m",
    summary: "Gentle wake-up pulse for the biggest leaves.",
    cadenceLabel: "Weekdays",
    enabled: true,
    order: 2,
    lastRunText: "Today • 7:02 AM",
  },
  {
    id: "drain-check",
    name: "Drain Check",
    plantId: "neon-pothos",
    triggerBelow: 30,
    durationSeconds: 20,
    scheduleLabel: "Every 12h • sensor check",
    nextRunLabel: "Tonight • 11:45 PM",
    countdownLabel: "6h 10m",
    summary: "Skips watering unless the moisture curve drops quickly.",
    cadenceLabel: "Every 12h",
    enabled: false,
    order: 3,
    lastRunText: "Today • 11:45 AM",
  },
];

export const initialSettings = {
  notificationsEnabled: true,
  moistureAlerts: true,
  automationDigests: false,
  themePreference: "midnight",
  accountName: "Avery Flores",
  accountEmail: "avery@soilflow.app",
  gardenName: "Atrium Shelf Garden",
  hardwareProfile: "Mock Mode",
};

export const scheduleOptions = [
  "Daily • 7:30 PM",
  "Weekdays • 7:00 AM",
  "Every 12h • sensor check",
  "Weekend • 9:15 AM",
];

export const themeOptions = [
  {
    id: "midnight",
    label: "Midnight Soil",
    description: "Matches the current Sleek.Design dark UI.",
  },
  {
    id: "mist",
    label: "Mist Preview",
    description: "Saved as a preference only for now.",
  },
];
