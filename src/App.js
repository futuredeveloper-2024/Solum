import React, { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import NoticeToast from "./components/NoticeToast";
import ScrollToTop from "./components/ScrollToTop";
import { SoilFlowProvider } from "./context/SoilFlowContext";
import AutomationsPage from "./pages/AutomationsPage";
import HomePage from "./pages/HomePage";
import PlantDetailPage from "./pages/PlantDetailPage";
import PlantOrganizerPage from "./pages/PlantOrganizerPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setNotice("");
    }, 3200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [notice]);

  const routes = [
    {
      path: "/",
      element: React.createElement(HomePage, { onNotify: setNotice }),
    },
    {
      path: "/home",
      element: React.createElement(Navigate, { to: "/", replace: true }),
    },
    {
      path: "/plants",
      element: React.createElement(PlantOrganizerPage, { onNotify: setNotice }),
    },
    {
      path: "/plant-organizer",
      element: React.createElement(Navigate, { to: "/plants", replace: true }),
    },
    {
      path: "/plants/:plantId",
      element: React.createElement(PlantDetailPage, { onNotify: setNotice }),
    },
    {
      path: "/plant-detail",
      element: React.createElement(PlantDetailPage, { onNotify: setNotice }),
    },
    {
      path: "/plant-detail/:plantId",
      element: React.createElement(PlantDetailPage, { onNotify: setNotice }),
    },
    {
      path: "/automations",
      element: React.createElement(AutomationsPage, { onNotify: setNotice }),
    },
    {
      path: "/settings",
      element: React.createElement(SettingsPage, { onNotify: setNotice }),
    },
    {
      path: "*",
      element: React.createElement(Navigate, { to: "/", replace: true }),
    },
  ];

  return React.createElement(
    SoilFlowProvider,
    null,
    React.createElement(
      React.Fragment,
      null,
      React.createElement(ScrollToTop),
      React.createElement(
        Routes,
        null,
        routes.map((routeDefinition) =>
          React.createElement(Route, {
            key: routeDefinition.path,
            path: routeDefinition.path,
            element: routeDefinition.element,
          }),
        ),
      ),
      React.createElement(NoticeToast, { message: notice }),
    ),
  );
}
