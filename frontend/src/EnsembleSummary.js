import React, { useState, useEffect } from "react";
import "./TransformedTable.css";
import { useNavigate } from "react-router-dom";
import CustomerModal from "./CustomerModal";
import logo from "./zt.png";
import "./AlertModal.css";
import config from "./config";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  Label,
} from "recharts";

const EnsembleSummary = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [CustomerData, setCustomerData] = useState();
  const [open, setOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [aucData, setAucData] = useState([]);
  const [apData, setApData] = useState([]);
  const [cpData, setCpData] = useState([]);

  const columns = [
    "column",
    "Baseline Bagging",
    "Baseline RF",
    "Baseline XGBoost",
  ];

  useEffect(() => {
    fetchData();
    fetchAuc();
    fetchAp();
    fetchCp();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/get_summary`);
      const json = await res.json();

      const parsedData = JSON.parse(json);
      console.log(parsedData);

      // Always update the rows data
      setRows(parsedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchAuc = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/get_auc_table`);
      const json = await res.json();

      // Assuming your API returns an array of objects with "Threshold", "ROC_TPR", and "ROC_FPR" properties
      const parsedData = JSON.parse(json);
      console.log("AUC", parsedData);

      // Check if the rocData state is empty before setting it
      if (aucData.length === 0) {
        setAucData(parsedData);
      }

      // Always update the rows data
      // setRows(parsedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchAp = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/get_ap_table`);
      const json = await res.json();

      // Assuming your API returns an array of objects with "Threshold", "ROC_TPR", and "ROC_FPR" properties
      const parsedData = JSON.parse(json);
      console.log("AP", parsedData);

      // Check if the rocData state is empty before setting it
      if (apData.length === 0) {
        setApData(parsedData);
      }

      // Always update the rows data
      // setRows(parsedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchCp = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/get_cp_table`);
      const json = await res.json();

      // Assuming your API returns an array of objects with "Threshold", "ROC_TPR", and "ROC_FPR" properties
      const parsedData = JSON.parse(json);
      console.log("CP", parsedData);

      // Check if the rocData state is empty before setting it
      if (cpData.length === 0) {
        setCpData(parsedData);
      }

      // Always update the rows data
      // setRows(parsedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSummary = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/ensemble_summary`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Transformation successful
        window.location.reload();
      } else if (response.status === 404) {
        // No active table present
        setShowAlert(true);
      } else {
        // Transformation failed
        console.error("Error transforming data");
      }
    } catch (error) {
      console.error("Error transforming data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Ensemble Summary";
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
          Ensemble Summary
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
          <li className="nav-item">Predictions</li>
          <li className="nav-item" onClick={() => navigate("/tb_metrics")}>
            TB-Metrics
          </li>
          <li className="nav-item" onClick={() => navigate("/tf_metrics")}>
            TF-Metrics
          </li>
          <li className="nav-item" onClick={() => navigate("/ensemble")}>
            Ensemble
          </li>
          <li className="nav-item">En-Summary</li>
          <li className="nav-item" onClick={() => navigate("/deep_learning")}>
            Train-Model-GSCV
          </li>
          <li className="nav-item" onClick={() => navigate("/train_model")}>
            Train-Model-BSCV
          </li>
          <li className="nav-item" onClick={() => navigate("/inference")}>
            Inference
          </li>
          <li className="nav-item" onClick={() => navigate("/autoencoder")}>
            Autoencoder-Metrics
          </li>
          <li
            // style={{ marginLeft: "1230px" }}
            className="nav-item"
            onClick={() => navigate("/archives")}
          >
            Archives
          </li>
        </ul>
      </nav>

      <div>
        <button
          className="stream-button"
          style={{ float: "right" }}
          onClick={handleSummary}
          disabled={loading} // Disable the button while loading
        >
          {loading ? "Generating..." : "Generate Summary"}
        </button>
      </div>

      {showAlert && (
        <div className="custom-modal">
          <div className="modal-content">
            <h2>Alert</h2>
            <p>No transformed table available</p>
            <button
              style={{ float: "right" }}
              onClick={() => setShowAlert(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div style={{ width: "100%", overflowX: "scroll" }}>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Baseline Bagging</th>
              <th>Baseline Random Forest</th>
              <th>Baseline XGBoost</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((d, i) => (
                <tr>
                  <td>{d[columns[0]]}</td>
                  <td>{d[columns[1]]}</td>
                  <td>{d[columns[2]]}</td>
                  <td>{d[columns[3]]}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>
                  No data available for the current table.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: "10px", fontSize: "25px" }}>
        <strong>Bar Graphs:</strong>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <div>
          <h2 style={{ textAlign: "center" }}>AUC</h2>
          <BarChart width={600} height={500} data={aucData}>
            <XAxis dataKey="classifier"></XAxis>
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="validation" fill="#E29000  " name="Validation" />
            <Bar dataKey="test" fill="#3146DD" name="Test" />
          </BarChart>
        </div>

        <div>
          <h2 style={{ textAlign: "center" }}>Average Precision</h2>
          <BarChart width={600} height={500} data={apData}>
            <XAxis dataKey="classifier"></XAxis>
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="validation" fill="#E29000  " name="Validation" />
            <Bar dataKey="test" fill="#3146DD" name="Test" />
          </BarChart>
        </div>

        <div>
          <h2 style={{ textAlign: "center" }}>Card Precision@100</h2>
          <BarChart width={600} height={500} data={cpData}>
            <XAxis dataKey="classifier"></XAxis>
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="validation" fill="#E29000  " name="Validation" />
            <Bar dataKey="test" fill="#3146DD" name="Test" />
          </BarChart>
        </div>
      </div>
      <CustomerModal
        open={open}
        setOpen={setOpen}
        rows={CustomerData}
        setRows={setCustomerData}
      />
    </div>
  );
};
export default EnsembleSummary;
