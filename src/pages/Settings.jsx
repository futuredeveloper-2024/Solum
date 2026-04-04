import React, { useEffect, useState } from "react";
import Icon from "../components/Icon";

const DEVICE_STATUSES = [
  { label: "Temperature Sensor", value: "OK", tone: "ok" },
  { label: "Soil Moisture Sensor", value: "Not Detected", tone: "error" },
  { label: "ESP32 Connection", value: "Connected", tone: "ok" },
];

function getProfileFieldError(label, value, maxLength) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return `${label} cannot be empty.`;
  }

  if (maxLength && trimmedValue.length > maxLength) {
    return `${label} must be ${maxLength} characters or fewer.`;
  }

  return "";
}

function getStatusClasses(tone) {
  switch (tone) {
    case "error":
      return {
        dotClass: "bg-destructive",
        badgeClass: "bg-destructive/10 text-destructive",
      };
    case "unknown":
      return {
        dotClass: "bg-muted-foreground",
        badgeClass: "bg-muted text-muted-foreground",
      };
    case "ok":
    default:
      return {
        dotClass: "bg-primary",
        badgeClass: "bg-primary/10 text-primary",
      };
  }
}

function ToggleButton({ checked, onClick, title, description }) {
  return (
    <div className="flex flex-col gap-4 rounded-[1.25rem] border border-border bg-background px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <h4 className="font-heading text-base font-semibold text-foreground">{title}</h4>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        onClick={onClick}
        className={`relative inline-flex h-8 w-14 shrink-0 self-end rounded-full transition-colors sm:self-center ${checked ? "bg-primary" : "bg-muted"}`}
        aria-pressed={checked}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${checked ? "translate-x-7" : "translate-x-1"}`}
        />
      </button>
    </div>
  );
}

function EditableProfileField({ label, value, maxLength, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(value);
  const [error, setError] = useState("");

  useEffect(() => {
    setDraftValue(value);
    setError("");
  }, [value]);

  function handleSave() {
    const validationError = getProfileFieldError(label, draftValue, maxLength);

    if (validationError) {
      setError(validationError);
      return;
    }

    onSave("accountName", draftValue.trim());
    setError("");
    setIsEditing(false);
  }

  function handleCancel() {
    setDraftValue(value);
    setError("");
    setIsEditing(false);
  }

  return (
    <div className="rounded-[1rem] bg-background px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
          {isEditing ? (
            <div className="mt-3 space-y-3">
              <input
                type="text"
                maxLength={maxLength}
                value={draftValue}
                onChange={(event) => {
                  setDraftValue(event.target.value.slice(0, maxLength));

                  if (error) {
                    setError("");
                  }
                }}
                className="w-full rounded-[0.9rem] border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">
                {draftValue.length}/{maxLength} characters
              </p>
              {error ? <p className="text-sm font-medium text-accent">{error}</p> : null}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-full bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm font-semibold text-foreground break-words">{value}</p>
          )}
        </div>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="self-start rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 sm:self-auto"
          >
            Edit
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function Settings({ settings, onChange }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6">
      <div className="mobile-card rounded-[1.25rem] border border-border bg-gradient-to-br from-secondary to-card p-4 shadow-md sm:p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-secondary-foreground">Preferences</p>
        <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Tune SoilFlow for your garden, keep the dashboard readable on mobile, and track the sensor health indicators that will support future device monitoring.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="mobile-card rounded-[1.25rem] border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <Icon icon="solar:bell-bing-bold" className="size-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold text-foreground">Notifications</h3>
              <p className="text-xs text-muted-foreground">Alerts and reminders</p>
            </div>
          </div>
          <div className="space-y-3">
            <ToggleButton
              checked={settings.notifications}
              onClick={() => onChange("notifications", !settings.notifications)}
              title="Push notifications"
              description="Receive reminders when watering routines are due."
            />
            <ToggleButton
              checked={settings.autoSync}
              onClick={() => onChange("autoSync", !settings.autoSync)}
              title="Auto sync"
              description="Keep the dashboard refreshed while the app is open."
            />
          </div>
        </div>

        <div className="mobile-card rounded-[1.25rem] border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-full bg-chart-3/10 p-2 text-chart-3">
              <Icon icon="solar:palette-round-bold" className="size-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold text-foreground">Appearance</h3>
              <p className="text-xs text-muted-foreground">Theme behavior</p>
            </div>
          </div>
          <ToggleButton
            checked={settings.darkTheme}
            onClick={() => onChange("darkTheme", !settings.darkTheme)}
            title="Dark dashboard theme"
            description="Turn this off to switch the full app into a clean light theme."
          />
          <div className="mt-4 rounded-[1rem] border border-border bg-background px-4 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Theme status</p>
            <p className="mt-2 text-sm font-semibold text-foreground">
              {settings.darkTheme ? "Dark mode is active" : "Light mode is active"}
            </p>
          </div>
        </div>
      </div>

      <div className="mobile-card rounded-[1.25rem] border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-full bg-accent/10 p-2 text-accent">
            <Icon icon="solar:home-angle-bold" className="size-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-foreground">Garden Profile</h3>
            <p className="text-xs text-muted-foreground">Name shown around the app</p>
          </div>
        </div>
        <EditableProfileField
          label="Garden Name"
          value={settings.accountName}
          maxLength={50}
          onSave={onChange}
        />
      </div>

      <div className="mobile-card rounded-[1.25rem] border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-full bg-destructive/10 p-2 text-destructive">
            <Icon icon="solar:shield-warning-bold" className="size-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-foreground">Device Status</h3>
            <p className="text-xs text-muted-foreground">Static hardware indicators for now</p>
          </div>
        </div>

        <div className="grid gap-3">
          {DEVICE_STATUSES.map((status) => {
            const statusClasses = getStatusClasses(status.tone);

            return (
              <div
                key={status.label}
                className="flex flex-col gap-3 rounded-[1rem] border border-border bg-background px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{status.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Preview state only</p>
                </div>
                <span className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-xs font-semibold ${statusClasses.badgeClass}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${statusClasses.dotClass}`} />
                  {status.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
