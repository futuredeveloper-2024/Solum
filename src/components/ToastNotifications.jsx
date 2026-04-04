import React, { useEffect } from "react";
import Icon from "./Icon";

const TOAST_STYLES = {
  error: {
    icon: "solar:danger-circle-bold",
    className: "border-accent/30 bg-card text-foreground shadow-lg shadow-black/10",
    iconClassName: "bg-accent/10 text-accent",
  },
  success: {
    icon: "solar:check-circle-bold",
    className: "border-primary/30 bg-card text-foreground shadow-lg shadow-black/10",
    iconClassName: "bg-primary/10 text-primary",
  },
  info: {
    icon: "solar:info-circle-bold",
    className: "border-chart-3/30 bg-card text-foreground shadow-lg shadow-black/10",
    iconClassName: "bg-chart-3/10 text-chart-3",
  },
};

function ToastItem({ notification, onDismiss }) {
  const tone = TOAST_STYLES[notification.type] || TOAST_STYLES.info;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onDismiss(notification.id);
    }, notification.duration ?? 3200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [notification.duration, notification.id, onDismiss]);

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-[1.25rem] border px-4 py-3 backdrop-blur-xl transition-all ${tone.className}`}
      role="status"
      aria-live="polite"
    >
      <div className={`mt-0.5 rounded-full p-2 ${tone.iconClassName}`}>
        <Icon icon={tone.icon} className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        {notification.title ? (
          <p className="text-sm font-semibold text-foreground">{notification.title}</p>
        ) : null}
        <p className="text-sm leading-5 text-muted-foreground">{notification.message}</p>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(notification.id)}
        className="rounded-full bg-muted/70 p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        aria-label="Dismiss notification"
      >
        <Icon icon="solar:close-circle-linear" className="size-4" />
      </button>
    </div>
  );
}

export default function ToastNotifications({ notifications, onDismiss }) {
  if (!notifications.length) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex justify-center px-4 sm:justify-end">
      <div className="flex w-full max-w-sm flex-col gap-3">
        {notifications.map((notification) => (
          <ToastItem
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </div>
  );
}
