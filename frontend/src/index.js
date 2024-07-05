import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import TransformedTable from "./TransformedTable";
import Results from "./Results";
import CustomerTable from "./CustomerTable";
import TerminalTable from "./TerminalTable";
import ThresholdBasedMetrics from "./ThresholdBasedMetrics";
import ThresholdFreeMetrics from "./ThresholdFreeMetrics";
import ArchiveTable from "./ArchiveTable";
import Ensemble from "./Ensemble";
import EnsembleSummary from "./EnsembleSummary";
import Deeplearning from "./DeepLearning";
import TrainModel from "./TrainModel";
import Inference from "./Inference";
import AutoencoderMetrics from "./AutoencoderMetrics";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/transformed" element={<TransformedTable />} />
      <Route path="/results" element={<Results />} />
      <Route path="/customers" element={<CustomerTable />} />
      <Route path="/terminals" element={<TerminalTable />} />
      <Route path="/tb_metrics" element={<ThresholdBasedMetrics />} />
      <Route path="/tf_metrics" element={<ThresholdFreeMetrics />} />
      <Route path="/archives" element={<ArchiveTable />} />
      <Route path="/ensemble" element={<Ensemble />} />
      <Route path="/summary" element={<EnsembleSummary />} />
      <Route path="/deep_learning" element={<Deeplearning />} />
      <Route path="/train_model" element={<TrainModel />} />
      <Route path="/inference" element={<Inference />} />
      <Route path="/autoencoder" element={<AutoencoderMetrics />} />
    </Routes>
  </Router>
);
