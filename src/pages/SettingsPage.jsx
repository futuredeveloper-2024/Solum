import { useEffect, useMemo, useState } from "react";
import BottomNav from "../components/BottomNav";
import ToggleSwitch from "../components/ToggleSwitch";
import { useSoilFlow } from "../context/SoilFlowContext";
import { themeOptions } from "../data/plants";

export default function SettingsPage({ onNotify }) {
  const { settings, system, updateSettings } = useSoilFlow();
  const [profileDraft, setProfileDraft] = useState({
    accountName: settings.accountName,
    accountEmail: settings.accountEmail,
    gardenName: settings.gardenName,
  });

  useEffect(() => {
    document.title = "SoilFlow | Settings";
  }, []);

  useEffect(() => {
    setProfileDraft({
      accountName: settings.accountName,
      accountEmail: settings.accountEmail,
      gardenName: settings.gardenName,
    });
  }, [settings.accountEmail, settings.accountName, settings.gardenName]);

  const notificationRows = useMemo(() => {
    return [
      {
        key: "notificationsEnabled",
        title: "Push Notifications",
        description: "Receive system updates and cycle completions.",
      },
      {
        key: "moistureAlerts",
        title: "Low Moisture Alerts",
        description: "Warn when a plant drops below its threshold.",
      },
      {
        key: "automationDigests",
        title: "Automation Digests",
        description: "Send a daily summary of scheduled rules.",
      },
    ];
  }, []);

  const handleSaveProfile = () => {
    updateSettings(profileDraft);
    onNotify("Account settings saved locally.");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24 font-sans text-foreground">
      <header className="px-5 pt-8 pb-4">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Tune alerts, theme preferences, and mock account details
        </p>
      </header>

      <main className="flex flex-1 flex-col gap-6 px-5">
        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">{settings.gardenName}</p>
              <p className="text-xs text-muted-foreground">
                {settings.hardwareProfile} &bull; Reservoir {system.reservoirLevel}%
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {settings.themePreference === "midnight" ? "Midnight Soil" : "Mist Preview"}
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Notifications
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            {notificationRows.map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/40 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{row.title}</p>
                  <p className="text-xs text-muted-foreground">{row.description}</p>
                </div>
                <ToggleSwitch
                  checked={settings[row.key]}
                  onChange={(checked) => {
                    updateSettings({ [row.key]: checked });
                    onNotify(`${row.title} ${checked ? "enabled" : "disabled"}.`);
                  }}
                  label={row.title}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5">
          <h2 className="font-heading text-lg font-semibold text-foreground">Theme Preference</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {themeOptions.map((theme) => {
              const active = settings.themePreference === theme.id;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => {
                    updateSettings({ themePreference: theme.id });
                    onNotify(`${theme.label} saved as your local preference.`);
                  }}
                  className={`rounded-3xl border p-4 text-left transition-all ${
                    active
                      ? "border-primary/40 bg-primary/10 shadow-lg shadow-primary/10"
                      : "border-border bg-background/40 hover:border-primary/20"
                  }`}
                >
                  <p className="font-semibold text-foreground">{theme.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{theme.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              Account Details
            </h2>
            <button
              type="button"
              onClick={handleSaveProfile}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
            >
              Save
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-foreground">Account Name</span>
              <input
                type="text"
                value={profileDraft.accountName}
                onChange={(event) =>
                  setProfileDraft((currentDraft) => ({
                    ...currentDraft,
                    accountName: event.target.value,
                  }))
                }
                className="rounded-2xl border border-border bg-background/60 px-4 py-3 text-foreground outline-none transition focus:border-primary/60"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-foreground">Email</span>
              <input
                type="email"
                value={profileDraft.accountEmail}
                onChange={(event) =>
                  setProfileDraft((currentDraft) => ({
                    ...currentDraft,
                    accountEmail: event.target.value,
                  }))
                }
                className="rounded-2xl border border-border bg-background/60 px-4 py-3 text-foreground outline-none transition focus:border-primary/60"
              />
            </label>
          </div>

          <label className="mt-4 flex flex-col gap-2 text-sm">
            <span className="font-medium text-foreground">Garden Name</span>
            <input
              type="text"
              value={profileDraft.gardenName}
              onChange={(event) =>
                setProfileDraft((currentDraft) => ({
                  ...currentDraft,
                  gardenName: event.target.value,
                }))
              }
              className="rounded-2xl border border-border bg-background/60 px-4 py-3 text-foreground outline-none transition focus:border-primary/60"
            />
          </label>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
