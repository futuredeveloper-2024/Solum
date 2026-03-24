import React from "react";

export default function Icon({ icon, className = "", ...props }) {
  return React.createElement("iconify-icon", {
    icon,
    class: className,
    ...props,
  });
}
