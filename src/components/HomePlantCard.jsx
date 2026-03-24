import { Link } from "react-router-dom";
import Icon from "./Icon";
import MoistureRing from "./MoistureRing";

export default function HomePlantCard({ plant }) {
  return (
    <Link to={`/plants/${plant.id}`} className={plant.homeCardClass}>
      {plant.homeOverlayClass ? <div className={plant.homeOverlayClass}></div> : null}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border/50">
        <img src={plant.image} alt={plant.fullName} className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h4 className="truncate font-heading text-base font-semibold text-foreground">
            {plant.name}
          </h4>
          <span
            className={`shrink-0 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${plant.homeStatus.containerClass}`}
          >
            <Icon icon={plant.homeStatus.icon} className="size-3" />
            {plant.homeStatus.label}
          </span>
        </div>
        <p className="mb-3 truncate text-xs text-muted-foreground">
          {plant.fullName} &bull; {plant.channelLabel.replace("CH", "Ch")}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MoistureRing
              value={plant.moisture}
              toneClass={plant.moistureToneClass}
              labelClass={
                plant.moistureToneClass === "text-accent" ? "text-accent" : "text-foreground"
              }
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Moisture
              </span>
              <span className={`text-xs ${plant.moistureLabelClass}`}>{plant.moistureLabel}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Watered
            </span>
            <span className="text-xs font-medium text-foreground">{plant.wateredAgo}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
