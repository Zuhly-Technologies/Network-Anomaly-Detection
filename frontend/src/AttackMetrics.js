import React, { useState, useEffect } from "react";
import "./TransformedTable.css";
import { useNavigate } from "react-router-dom";
import logo from "./zt.png";
import config from "./config";

const AttackMetrics = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/get_attack_metrics`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/generate_attack_metrics`, {
        method: "GET",
      });

      if (response.ok) {
        // Generation successful
        fetchData(); // Refresh data after generation
      } else {
        console.error("Error generating metrics");
      }
    } catch (error) {
      console.error("Error generating metrics", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    document.title = "Attack Metrics";
  }, []);

  const renderTable = (rows, columns) => {
    return (
      <div style={{ width: "100%", overflowX: "scroll", marginBottom: "20px" }}>
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={column}>{row[column]}</td>
                  ))}
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
    );
  };

  const columns = [
    "ML algorithm",
    "accuracy",
    "Precision",
    "Recall",
    "F1-score",
    "Optimal Threshold",
  ];

  return (
    <div className="app-container">
      <div>
        <img
          src={logo}
          alt="Logo"
          style={{ height: "150px", marginRight: "50px" }}
        />

        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
          Attack Metrics
        </h1>
      </div>

      <nav className="navbar">
        <ul className="nav-list">
          <li
            className="nav-item"
            onClick={() => navigate("/feature_selection")}
          >
            Feature Selection
          </li>
          <li className="nav-item">Attack Metrics</li>
          <li className="nav-item" onClick={() => navigate("/all_metrics")}>
            All-Metrics
          </li>
        </ul>
      </nav>

      <div>
        <button
          className="stream-button"
          style={{ float: "right" }}
          onClick={handleGenerateMetrics}
          disabled={loading} // Disable the button while loading
        >
          {loading ? "Generating..." : "Generate Metrics"}
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {Object.keys(data).map((attackType) => (
            <div key={attackType}>
              <h2>{attackType}</h2>
              {renderTable(data[attackType], columns)}
            </div>
          ))}
        </>
      )}

      {showAlert && (
        <div className="custom-modal">
          <div className="modal-content">
            <h2>Alert</h2>
            <p>No active table available</p>
            <button
              style={{ float: "right" }}
              onClick={() => setShowAlert(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttackMetrics;
