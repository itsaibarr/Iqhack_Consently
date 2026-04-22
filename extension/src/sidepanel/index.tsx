import React from "react";
import { createRoot } from "react-dom/client";
import SidePanelApp from "./SidePanelApp";
import "../index.css";

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <SidePanelApp />
    </React.StrictMode>
  );
}
