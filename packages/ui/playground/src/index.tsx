import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Playground } from "./App.tsx";

import "../../src/global.css";

createRoot(document.querySelector("#app")!).render(
  <StrictMode>
    <Playground />
  </StrictMode>,
);
