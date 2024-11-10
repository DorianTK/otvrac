import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Info from "./components/Info/Info";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Info></Info>
    </StrictMode>
);
