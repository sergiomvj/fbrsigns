import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./utils/i18n";

console.log('App Version: 2026.01.13.12.35 - Cache Busting Active');

createRoot(document.getElementById("root")!).render(<App />);
