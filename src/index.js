import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const root_element = document.getElementById("root");
const root = createRoot(root_element);
root.render(<App />);
