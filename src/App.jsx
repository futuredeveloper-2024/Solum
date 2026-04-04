import React, { useEffect, useState } from "react";
import Icon from "./components/Icon";
import ToastNotifications from "./components/ToastNotifications";
import Automations from "./pages/Automations";
import Home from "./pages/Home";
import Plants from "./pages/Plants";
import Settings from "./pages/Settings";
import {
  AUTOMATIONS_STORAGE_KEY,
  PLANTS_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  readStoredAutomations,
  readStoredPlants,
  readStoredSettings,
} from "./utils/soilFlowState";

function getNavButtonClass(isActive) {
  return isActive
    ? "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl p-2 text-primary"
    : "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl p-2 text-muted-foreground transition-colors hover:text-foreground";
}

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [plants, setPlants] = useState(readStoredPlants);
  const [automations, setAutomations] = useState(readStoredAutomations);
  const [pumpStatus, setPumpStatus] = useState("Idle");
  const [settings, setSettings] = useState(readStoredSettings);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(PLANTS_STORAGE_KEY, JSON.stringify(plants));
  }, [plants]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(AUTOMATIONS_STORAGE_KEY, JSON.stringify(automations));
  }, [automations]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const theme = settings.darkTheme ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.body.dataset.theme = theme;
  }, [settings.darkTheme]);

  function handleSettingsChange(key, value) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      [key]: value,
    }));
  }

  function notify({ type = "info", title = "", message, duration }) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    setNotifications((currentNotifications) => [
      ...currentNotifications,
      {
        id,
        type,
        title,
        message,
        duration,
      },
    ]);
  }

  function dismissNotification(id) {
    setNotifications((currentNotifications) =>
      currentNotifications.filter((notification) => notification.id !== id),
    );
  }

  let activePageView;

  switch (activePage) {
    case "plants":
      activePageView = (
        <Plants
          plants={plants}
          setPlants={setPlants}
          onNavigate={setActivePage}
          notify={notify}
        />
      );
      break;
    case "automations":
      activePageView = (
        <Automations
          plants={plants}
          automations={automations}
          setAutomations={setAutomations}
          onNavigate={setActivePage}
          notify={notify}
        />
      );
      break;
    case "settings":
      activePageView = (
        <Settings
          settings={settings}
          onChange={handleSettingsChange}
        />
      );
      break;
    case "home":
    default:
      activePageView = (
        <Home
          plants={plants}
          automations={automations}
          onNavigate={setActivePage}
        />
      );
      break;
  }

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-background pb-24 font-sans text-foreground">
      <ToastNotifications notifications={notifications} onDismiss={dismissNotification} />
      <div className="flex min-h-screen w-full min-w-0 flex-1 flex-col overflow-x-hidden">
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 px-4 py-3 shadow-sm backdrop-blur-xl sm:px-5">
          <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <Icon icon="solar:droplet-minimalistic-bold" className="size-5 text-primary" />
              <span className="font-heading text-base font-semibold tracking-tight text-primary">
                SoilFlow
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
              <div className="flex min-w-0 items-center gap-1.5" title="Pump Status">
                <Icon
                  icon="material-symbols:water-pump-rounded"
                  className="size-4 text-foreground"
                />
                <span>{pumpStatus}</span>
              </div>
              <div className="flex min-w-0 items-center gap-1.5" title="Reservoir Level">
                <Icon icon="solar:waterdrops-bold" className="size-4 text-chart-3" />
                <span>72%</span>
              </div>
              <div className="flex items-center gap-1.5" title="Wi-Fi Signal">
                <Icon icon="solar:wi-fi-bold" className="size-4 text-primary" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 pt-5 sm:px-5 sm:pt-6">
          <div className="mx-auto flex h-full w-full max-w-6xl min-w-0 flex-col">
            <div key={activePage} className="page-transition flex h-full min-w-0 flex-col">
              {activePageView}
            </div>
          </div>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/90 px-3 pt-2 pb-safe backdrop-blur-xl sm:px-4">
          <div className="mx-auto grid w-full max-w-3xl grid-cols-4 gap-1 pb-2">
            <button
              type="button"
              onClick={() => setActivePage("home")}
              className={getNavButtonClass(activePage === "home")}
            >
              <Icon icon="solar:home-2-bold" className="size-6" />
              <span className="text-[10px] font-medium">Home</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePage("plants")}
              className={getNavButtonClass(activePage === "plants")}
            >
              <Icon icon="solar:leaf-linear" className="size-6" />
              <span className="text-[10px] font-medium">Plants</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePage("automations")}
              className={getNavButtonClass(activePage === "automations")}
            >
              <Icon icon="solar:history-linear" className="size-6" />
              <span className="text-[10px] font-medium">Automations</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePage("settings")}
              className={getNavButtonClass(activePage === "settings")}
            >
              <Icon icon="solar:settings-linear" className="size-6" />
              <span className="text-[10px] font-medium">Settings</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
