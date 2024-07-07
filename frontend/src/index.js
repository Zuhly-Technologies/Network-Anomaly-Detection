import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import AttackMetrics from "./AttackMetrics";
import AllMetrics from "./AllMetrics";
import SampleData from "./SampleData";
import FeatureSelection from "./FeatureSelection";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<AttackMetrics />} />
      <Route path="/all_metrics" element={<AllMetrics />} />
      <Route path="/sample" element={<SampleData />} />
      <Route path="/feature_selection" element={<FeatureSelection />} />
    </Routes>
  </Router>
);
