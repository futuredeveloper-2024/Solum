export const MAX_PLANTS = 8;
export const PLANTS_STORAGE_KEY = "plants";
export const AUTOMATIONS_STORAGE_KEY = "soilflow-automations";
export const SETTINGS_STORAGE_KEY = "soilflow-settings";
export const AUTOMATION_NAME_MAX_LENGTH = 50;

export const DEFAULT_SETTINGS = {
  notifications: true,
  darkTheme: true,
  autoSync: true,
  accountName: "SoilFlow Grower",
};

export const DAY_OPTIONS = [
  { key: "mon", label: "Mon", fullLabel: "Monday" },
  { key: "tue", label: "Tue", fullLabel: "Tuesday" },
  { key: "wed", label: "Wed", fullLabel: "Wednesday" },
  { key: "thu", label: "Thu", fullLabel: "Thursday" },
  { key: "fri", label: "Fri", fullLabel: "Friday" },
  { key: "sat", label: "Sat", fullLabel: "Saturday" },
  { key: "sun", label: "Sun", fullLabel: "Sunday" },
];

const DAY_TO_WEEK_INDEX = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

const DEFAULT_MOISTURE_LEVELS = [84, 58, 26];

function readStorageArray(key) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(key);
    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    console.warn(`Unable to read ${key} from localStorage.`, error);
    return [];
  }
}

function readStorageObject(key, fallbackValue) {
  if (typeof window === "undefined") {
    return fallbackValue;
  }

  try {
    const storedValue = window.localStorage.getItem(key);
    if (!storedValue) {
      return fallbackValue;
    }

    const parsedValue = JSON.parse(storedValue);
    if (!parsedValue || typeof parsedValue !== "object" || Array.isArray(parsedValue)) {
      return fallbackValue;
    }

    return parsedValue;
  } catch (error) {
    console.warn(`Unable to read ${key} from localStorage.`, error);
    return fallbackValue;
  }
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function isValidTimestamp(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function getInitialMoisture(index = 0) {
  return DEFAULT_MOISTURE_LEVELS[index % DEFAULT_MOISTURE_LEVELS.length];
}

function getDefaultLastWateredAt(moisture) {
  const now = Date.now();

  if (moisture >= 75) {
    return new Date(now - 3 * 60 * 60 * 1000).toISOString();
  }

  if (moisture >= 40) {
    return new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString();
  }

  return new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString();
}

export function getPlantStatus(moisture) {
  if (moisture >= 75) {
    return "hydrated";
  }

  if (moisture >= 40) {
    return "balanced";
  }

  return "dry";
}

export function getPlantStatusMeta(moisture) {
  const status = getPlantStatus(moisture);

  switch (status) {
    case "hydrated":
      return {
        key: status,
        label: "No water needed",
        shortLabel: "Hydrated",
        helperText: "Moisture levels are high and stable.",
        dotClass: "bg-chart-3",
        badgeClass: "bg-chart-3/10 text-chart-3",
        borderClass: "border-chart-3/25",
        surfaceClass: "bg-chart-3/10",
      };
    case "dry":
      return {
        key: status,
        label: "Needs watering",
        shortLabel: "Dry",
        helperText: "Soil is running dry and should be watered soon.",
        dotClass: "bg-accent",
        badgeClass: "bg-accent/10 text-accent",
        borderClass: "border-accent/30",
        surfaceClass: "bg-accent/10",
      };
    case "balanced":
    default:
      return {
        key: status,
        label: "Balanced",
        shortLabel: "Optimal",
        helperText: "Moisture sits in the healthy range.",
        dotClass: "bg-primary",
        badgeClass: "bg-primary/10 text-primary",
        borderClass: "border-primary/25",
        surfaceClass: "bg-primary/10",
      };
  }
}

export const STATUS_LEGEND_ITEMS = [
  {
    key: "hydrated",
    dotClass: "bg-chart-3",
    label: "Blue - no water needed",
  },
  {
    key: "balanced",
    dotClass: "bg-primary",
    label: "Green - balanced",
  },
  {
    key: "dry",
    dotClass: "bg-accent",
    label: "Orange - dry",
  },
];

export function formatRelativeTime(value) {
  if (!isValidTimestamp(value)) {
    return "Unknown";
  }

  const difference = Math.max(0, Date.now() - Date.parse(value));
  const totalMinutes = Math.floor(difference / (60 * 1000));

  if (totalMinutes < 1) {
    return "Just now";
  }

  if (totalMinutes < 60) {
    return `${totalMinutes}m ago`;
  }

  const totalHours = Math.floor(totalMinutes / 60);
  if (totalHours < 24) {
    return `${totalHours}h ago`;
  }

  const totalDays = Math.floor(totalHours / 24);
  return `${totalDays}d ago`;
}

export function normalizePlant(plant, index = 0) {
  const moisture =
    typeof plant?.moisture === "number" ? clamp(plant.moisture, 0, 100) : getInitialMoisture(index);

  return {
    id: typeof plant?.id === "string" ? plant.id : `${Date.now()}-${index}`,
    image: typeof plant?.image === "string" ? plant.image : "",
    name: typeof plant?.name === "string" ? plant.name : "",
    desc: typeof plant?.desc === "string" ? plant.desc : "",
    moisture,
    lastWateredAt: isValidTimestamp(plant?.lastWateredAt)
      ? plant.lastWateredAt
      : getDefaultLastWateredAt(moisture),
  };
}

export function readStoredPlants() {
  return readStorageArray(PLANTS_STORAGE_KEY)
    .filter(
      (plant) =>
        plant &&
        typeof plant === "object" &&
        typeof plant.id === "string" &&
        typeof plant.image === "string" &&
        typeof plant.name === "string" &&
        typeof plant.desc === "string",
    )
    .map((plant, index) => normalizePlant(plant, index));
}

export function createPlant(payload, index = 0) {
  const moisture = getInitialMoisture(index);

  return {
    id: `${Date.now()}-${index}`,
    image: payload.image,
    name: payload.name,
    desc: payload.desc,
    moisture,
    lastWateredAt: getDefaultLastWateredAt(moisture),
  };
}

export function waterPlantRecord(plant) {
  return {
    ...plant,
    moisture: 92,
    lastWateredAt: new Date().toISOString(),
  };
}

function normalizeAutomationPlants(automation) {
  const sourcePlants = Array.isArray(automation?.plants)
    ? automation.plants
    : typeof automation?.plantId === "string" && automation.plantId
      ? [automation.plantId]
      : [];

  return [...new Set(sourcePlants.filter((plantId) => typeof plantId === "string" && plantId))]
    .slice(0, MAX_PLANTS);
}

export function getAutomationPlantIds(automation) {
  return normalizeAutomationPlants(automation);
}

export function normalizeAutomation(automation, index = 0) {
  const validDays = Array.isArray(automation?.days)
    ? automation.days.filter((day) => DAY_OPTIONS.some((option) => option.key === day))
    : [];

  return {
    id: typeof automation?.id === "string" ? automation.id : `${Date.now()}-automation-${index}`,
    name:
      typeof automation?.name === "string" && automation.name.trim()
        ? automation.name.trim()
        : `Automation ${index + 1}`,
    time:
      typeof automation?.time === "string" && /^\d{2}:\d{2}$/.test(automation.time)
        ? automation.time
        : "07:30",
    days: validDays.length ? [...new Set(validDays)] : ["mon", "wed", "fri"],
    plants: normalizeAutomationPlants(automation),
    isActive: typeof automation?.isActive === "boolean" ? automation.isActive : true,
  };
}

export function getAutomationNextRunAt(automation, referenceDate = new Date()) {
  const normalizedAutomation = normalizeAutomation(automation);

  if (!normalizedAutomation.isActive || !normalizedAutomation.days.length) {
    return null;
  }

  const [hours, minutes] = normalizedAutomation.time.split(":").map(Number);
  let closestRun = null;

  normalizedAutomation.days.forEach((dayKey) => {
    const targetDay = DAY_TO_WEEK_INDEX[dayKey];

    if (typeof targetDay !== "number") {
      return;
    }

    const candidate = new Date(referenceDate);
    const dayOffset = (targetDay - referenceDate.getDay() + 7) % 7;

    candidate.setDate(referenceDate.getDate() + dayOffset);
    candidate.setHours(hours, minutes, 0, 0);

    if (candidate.getTime() <= referenceDate.getTime()) {
      candidate.setDate(candidate.getDate() + 7);
    }

    if (!closestRun || candidate.getTime() < closestRun.getTime()) {
      closestRun = candidate;
    }
  });

  return closestRun;
}

export function getNearestActiveAutomation(automations, referenceDate = new Date()) {
  let nextAutomation = null;

  automations.forEach((automation, index) => {
    const normalizedAutomation = normalizeAutomation(automation, index);
    const nextRunAt = getAutomationNextRunAt(normalizedAutomation, referenceDate);

    if (!nextRunAt) {
      return;
    }

    if (!nextAutomation || nextRunAt.getTime() < nextAutomation.nextRunAt.getTime()) {
      nextAutomation = {
        ...normalizedAutomation,
        nextRunAt,
      };
    }
  });

  return nextAutomation;
}

export function readStoredAutomations() {
  return readStorageArray(AUTOMATIONS_STORAGE_KEY)
    .filter((automation) => automation && typeof automation === "object")
    .map((automation, index) => normalizeAutomation(automation, index));
}

export function readStoredSettings() {
  const storedSettings = readStorageObject(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);

  return {
    ...DEFAULT_SETTINGS,
    ...storedSettings,
    notifications:
      typeof storedSettings.notifications === "boolean"
        ? storedSettings.notifications
        : DEFAULT_SETTINGS.notifications,
    darkTheme:
      typeof storedSettings.darkTheme === "boolean"
        ? storedSettings.darkTheme
        : DEFAULT_SETTINGS.darkTheme,
    autoSync:
      typeof storedSettings.autoSync === "boolean"
        ? storedSettings.autoSync
        : DEFAULT_SETTINGS.autoSync,
    accountName:
      typeof storedSettings.accountName === "string" && storedSettings.accountName.trim()
        ? storedSettings.accountName.trim()
        : DEFAULT_SETTINGS.accountName,
  };
}

export function formatTimeLabel(value) {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  const [hours, minutes] = value.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatAutomationSchedule(automation) {
  const dayLabels = DAY_OPTIONS.filter((day) => automation.days.includes(day.key)).map(
    (day) => day.label,
  );

  return `${dayLabels.join(", ")} at ${formatTimeLabel(automation.time)}`;
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
