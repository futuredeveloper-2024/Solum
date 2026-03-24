import { Link } from "react-router-dom";
import Icon from "./Icon";

export default function OrganizerPlantCard({ plant, onMenu }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5">
      <Link to={`/plants/${plant.id}`} className="flex min-w-0 flex-1 items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-muted">
          <img
            src={plant.image}
            alt={`${plant.name} thumbnail`}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base font-semibold text-foreground">{plant.name}</h3>
            <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
              {plant.channelLabel}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {plant.organizerStatus} &bull; Last check {plant.organizerLastCheck}
          </p>
        </div>
      </Link>
      <div className="flex items-center gap-3">
        <div className={`h-2 w-2 rounded-full ${plant.organizerIndicatorClass}`}></div>
        <button
          type="button"
          onClick={() => onMenu(plant)}
          className="text-muted-foreground transition-all hover:scale-105 hover:text-foreground active:scale-95"
          aria-label={`Open ${plant.name} options`}
        >
          <Icon icon="solar:menu-dots-vertical-linear" className="size-5" />
        </button>
      </div>
    </div>
  );
}
