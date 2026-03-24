import { NavLink, useLocation } from "react-router-dom";
import Icon from "./Icon";

const navItems = [
  {
    label: "Home",
    to: "/",
    activeIcon: "solar:home-2-bold",
    inactiveIcon: "solar:home-2-linear",
  },
  {
    label: "Plants",
    to: "/plants",
    activeIcon: "solar:leaf-bold",
    inactiveIcon: "solar:leaf-linear",
  },
  {
    label: "Automations",
    to: "/automations",
    activeIcon: "solar:history-linear",
    inactiveIcon: "solar:history-linear",
  },
  {
    label: "Settings",
    to: "/settings",
    activeIcon: "solar:settings-linear",
    inactiveIcon: "solar:settings-linear",
  },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  const isActive = (to) => {
    if (to === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(to);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/90 px-6 pt-2 pb-safe backdrop-blur-xl">
      <div className="flex items-center justify-between pb-2">
        {navItems.map((item) => {
          const active = isActive(item.to);

          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === "/"}
              className={`flex flex-col items-center gap-1 p-2 transition-colors ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon
                icon={active ? item.activeIcon : item.inactiveIcon}
                className="size-6"
              />
              <span className={`text-[10px] ${active ? "font-semibold" : "font-medium"}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
