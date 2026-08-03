import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "../src/index.css";
import FalconsLanding from "../FalconsLanding.jsx";
import AdminApp from "./admin/AdminApp.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FalconsLanding />} />
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
