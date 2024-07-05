import React, { useState, useEffect } from "react";
import "./TransformedTable.css";
import { useNavigate } from "react-router-dom";
import CustomerModal from "./CustomerModal";
import logo from "./zt.png";
import "./AlertModal.css";
import config from "./config";

const Inference = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [CustomerData, setCustomerData] = useState();
  const [open, setOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [sampling, setSampling] = useState("");

  const columns = [
    "hyperparamter_optimizer",
    "auc_roc",
    "average_precision",
    "precision_top_100",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/inference_metrics`);
      const json = await res.json();

      const parsedData = JSON.parse(json);
      console.log(parsedData);

      // Always update the rows data
      setRows(parsedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handlePrediction = async () => {
    if (sampling) {
      try {
        setLoading(true);

        const response = await fetch(`${config.apiUrl}/infer/${sampling}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          // Prediction successful
          window.location.reload();
        } else if (response.status === 404) {
          // No predictions available
          setShowAlert(true);
        } else {
          // Prediction failed
          console.error("Error generating predictions");
        }
      } catch (error) {
        console.error("Error generating predictions", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    document.title = "Inference";
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
          <li className="nav-item" onClick={() => navigate("/summary")}>
            En-Summary
          </li>
          <li className="nav-item" onClick={() => navigate("/deep_learning")}>
            Train-Model-GSCV
          </li>
          <li className="nav-item" onClick={() => navigate("/train_model")}>
            Train-Model-BSCV
          </li>
          <li className="nav-item">Inference</li>
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
          onClick={handlePrediction}
          disabled={loading} // Disable the button while loading
        >
          {loading ? "Generating..." : "Generate Metrics"}
        </button>
        <select
          value={sampling}
          onChange={(e) => setSampling(e.target.value)}
          style={{ marginLeft: "1px", width: "180px", fontSize: "21px" }}
          size={1}
        >
          <option value="">Select Model</option>
          <option value="bayes">BayesSearchCV</option>
          <option value="grid">GridSearchCV</option>
        </select>
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
              <th>Hyperparamter Optimizer</th>
              <th>AUC ROC</th>
              <th>Average precision</th>
              <th>Card Precision@100</th>
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
      <CustomerModal
        open={open}
        setOpen={setOpen}
        rows={CustomerData}
        setRows={setCustomerData}
      />
    </div>
  );
};
export default Inference;
