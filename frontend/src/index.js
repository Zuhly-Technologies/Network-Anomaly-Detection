import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import AttackMetrics from "./AttackMetrics";
import AllMetrics from "./AllMetrics";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<AttackMetrics />} />
      <Route path="/all_metrics" element={<AllMetrics />} />
    </Routes>
  </Router>
);
