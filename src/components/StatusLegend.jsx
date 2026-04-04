import React from "react";

export default function StatusLegend({ items }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${item.dotClass}`} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
