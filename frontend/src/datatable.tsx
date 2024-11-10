import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Table from "./components/Table/Table";


createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Table></Table>
    </StrictMode>
);