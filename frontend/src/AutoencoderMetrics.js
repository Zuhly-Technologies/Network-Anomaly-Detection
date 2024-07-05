import React, { useState, useEffect } from "react";
import "./TransformedTable.css";
import { useNavigate } from "react-router-dom";
import logo from "./zt.png";
import config from "./config";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Label,
  ReferenceLine,
} from "recharts";

const AutoencoderMetrics = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [model, setModel] = useState("");
  const [tfSelectedModel, setTfSelectedModel] = useState("");
  const [Auc, setAuc] = useState("");
  const [rocData, setRocData] = useState([]);
  const [prcData, setPrcData] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Retrieve the selected model from localStorage on component mount
    const TfStoredModel = localStorage.getItem("tfSelectedModel");
    if (TfStoredModel) {
      setTfSelectedModel(TfStoredModel);
    }

    const StoredAuc = localStorage.getItem("Auc");
    if (StoredAuc) {
      setAuc(StoredAuc);
    }

    fetchROC();
    fetchPRC();
  }, []);

  const fetchROC = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/autoencoder_auc_metrics`);
      const json = await res.json();

      // Assuming your API returns an array of objects with "Threshold", "ROC_TPR", and "ROC_FPR" properties
      const parsedData = JSON.parse(json);
      console.log("ROC", parsedData);

      // Check if the rocData state is empty before setting it
      if (rocData.length === 0) {
        setRocData(parsedData);
      }

      // Always update the rows data
      // setRows(parsedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchPRC = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/autoencoder_prc_metrics`);
      const json = await res.json();

      // Assuming your API returns an array of objects with "Threshold", "ROC_TPR", and "ROC_FPR" properties
      const parsedData = JSON.parse(json);
      console.log("PRC", parsedData);

      // Check if the rocData state is empty before setting it
      if (prcData.length === 0) {
        setPrcData(parsedData);
      }

      // Always update the rows data
      // setRows(parsedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleGenerateMetrics = async () => {
    setLoading(true);
    const res = await fetch(`${config.apiUrl}/get_autoencoder_metrics`);

    if (res.ok) {
      const json = await res.json();
      setLoading(false);
      setTfSelectedModel(model);
      localStorage.setItem("tfSelectedModel", model);
      console.log(json.ROC_AUC);
      console.log(json.AP);
      setAuc(json);
      localStorage.setItem("Auc", json);
      window.location.reload();
    } else if (res.status === 404) {
      // No predictions available
      setShowAlert(true);
    } else {
      // Prediction failed
      console.error("Error generating predictions");
    }
  };

  useEffect(() => {
    document.title = "Autoencoder Metrics";
  }, []);

  return (
    <div className="app-container">
      <div>
        <img
          src={logo}
          alt="Logo"
          style={{ height: "150px", marginRight: "50px" }}
        />

        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
          Autoencoder Metrics
        </h1>
      </div>
      <nav className="navbar">
        <ul className="nav-list">
          <li className="nav-item" onClick={() => navigate("/customers")}>
            Customer Profiles
          </li>
          <li className="nav-item" onClick={() => navigate("/terminals")}>
            Merchant Profiles
          </li>
          <li className="nav-item" onClick={() => navigate("/")}>
            Simulator
          </li>
          <li className="nav-item" onClick={() => navigate("/transformed")}>
            Transformed Table
          </li>
          <li className="nav-item" onClick={() => navigate("/results")}>
            Predictions
          </li>
          <li className="nav-item" onClick={() => navigate("/tb_metrics")}>
            TB-Metrics
          </li>
          <li className="nav-item">TF-Metrics</li>
          <li className="nav-item" onClick={() => navigate("/ensemble")}>
            Ensemble
          </li>
          <li className="nav-item" onClick={() => navigate("/summary")}>
            En-Summary
          </li>
          <li className="nav-item" onClick={() => navigate("/deep_learning")}>
            Train-Model-GSCV
          </li>
          <li className="nav-item" onClick={() => navigate("/train_model")}>
            Train-Model-BSCV
          </li>
          <li className="nav-item" onClick={() => navigate("/inference")}>
            Inference
          </li>
          <li className="nav-item">Autoencoder-Metrics</li>
          <li
            // style={{ marginLeft: "1230px" }}
            className="nav-item"
            onClick={() => navigate("/archives")}
          >
            Archives
          </li>
        </ul>
      </nav>

      {showAlert && (
        <div className="custom-modal">
          <div className="modal-content">
            <h2>Alert</h2>
            <p>No predictions table available</p>
            <button
              style={{ float: "right" }}
              onClick={() => {
                setShowAlert(false);
                setLoading(false);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div>
        <button
          className="stream-button"
          // style={{ float: "right" }}
          onClick={handleGenerateMetrics}
          disabled={loading} // Disable the button if no option is selected
        >
          {loading ? "Generating..." : "Generate Metrics"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          // justifyContent: "space-between",
          // alignItems: "center",
        }}
      >
        <LineChart
          width={1200}
          height={900}
          data={rocData}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="ROC_FPR"
            // domain={[0, 1]} // Set the domain for Recall from 0 to 1
            type="number"
          >
            <Label
              value="False Positive Rate"
              position="insideBottom"
              offset={-10}
            />
          </XAxis>
          <YAxis
            dataKey="ROC_TPR"
            // domain={[0, 1]} // Set the domain for Recall from 0 to 1
            type="number"
          >
            <Label
              value="True Positive Rate"
              angle={-90}
              position="insideLeft"
            />
          </YAxis>
          <Tooltip
            labelFormatter={(label) => (
              <span style={{ color: "#ff3933" }}>FPR: {label}</span>
            )}
            formatter={(value, name, props) => {
              console.log(props.payload);
              // const threshold = props.payload.Threshold;
              const rocTpr = props.payload.ROC_TPR.toString();

              return [
                <div>
                  TPR: {rocTpr}
                  {/* <div style={{ color: "grey" }}>Threshold: {threshold}</div> */}
                </div>,
              ];
            }}
          />

          <Line type="basis" dataKey="ROC_TPR" stroke="#8884d8" />

          {Auc !== null && (
            <Legend
              content={() => (
                <div
                  style={{
                    textAlign: "right",
                    fontSize: "25px",
                    marginTop: "10px", // Add top margin for separation
                  }}
                >
                  {/* AUC: {Auc.split(",")[0]} */}
                  AUC: {typeof Auc === "string" ? Auc.split(",")[0] : Auc}
                </div>
              )}
            />
          )}
        </LineChart>

        {/* ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */}

        <LineChart
          width={1200}
          height={900}
          data={prcData}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="TPR"
            domain={[0, 1]} // Set the domain for Recall from 0 to 1
            type="number" // Ensure that the axis is treated as numeric
          >
            <Label
              value="Recall (True Positive Rate)"
              position="insideBottom"
              offset={-10}
            />
          </XAxis>
          <YAxis
            dataKey="Precision"
            domain={[0, 1]} // Set the domain for Precision from 0 to 1
            type="number" // Ensure that the axis is treated as numeric
          >
            <Label value="Precision" angle={-90} position="insideLeft" />
          </YAxis>
          <Tooltip
            labelFormatter={(label) => (
              <span style={{ color: "#8884d8" }}>Recall: {label}</span>
            )}
            formatter={(value, name, props) => {
              // const threshold = props.payload.Threshold;
              const prc = props.payload.Precision.toString();

              return [
                <div>
                  Precision: {prc}
                  {/* <div style={{ color: "grey" }}>Threshold: {threshold}</div> */}
                </div>,
              ];
            }}
          />

          <Line type="basis" dataKey="Precision" stroke="#609f43" />

          {Auc !== null && (
            <Legend
              content={() => (
                <div
                  style={{
                    textAlign: "right",
                    fontSize: "25px",
                    marginTop: "10px",
                  }}
                >
                  Average Precision:{" "}
                  {typeof Auc === "string" ? Auc.split(",")[1] : Auc}
                </div>
              )}
            />
          )}
        </LineChart>
      </div>
    </div>
  );
};
export default AutoencoderMetrics;
