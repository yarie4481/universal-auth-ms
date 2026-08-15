import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { Callback } from "./Callback";
import "./styles.css";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element missing");
}

const page = window.location.pathname.startsWith("/callback") ? (
  <Callback />
) : (
  <App />
);

createRoot(root).render(<StrictMode>{page}</StrictMode>);
