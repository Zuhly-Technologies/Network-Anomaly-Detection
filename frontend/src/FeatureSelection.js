import React, { useState, useEffect } from "react";
import "./TransformedTable.css";
import { useNavigate } from "react-router-dom";
import logo from "./zt.png";
import config from "./config";

const FeatureSelection = () => {
  const [loading, setLoading] = useState(false);
  const [load, setLoad] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();
  const [sampling, setSampling] = useState("");
  const [value, setValue] = useState("");

  const handleSampling = async () => {
    if (value) {
      try {
        setLoad(true);
        console.log(value);
        const res = await fetch(`${config.apiUrl}/sample_dataset/${value}`);
        if (res.ok) {
          window.location.reload();
        } else {
          console.error("Error sampling dataset");
        }
      } catch (error) {
        console.error("Error sampling dataset", error);
      } finally {
        setLoad(false);
      }
    }
  };

  const handleFeatureSelection = async () => {
    if (sampling) {
      try {
        setLoading(true);

        const response = await fetch(
          `${config.apiUrl}/feature_selection/${sampling}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

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

  const handleValueChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue === "" || /^[0-9]+$/.test(inputValue)) {
      setValue(inputValue);
    }
  };

  useEffect(() => {
    document.title = "Feature Selection";
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
          Feature Selection
        </h1>
      </div>

      <nav className="navbar">
        <ul className="nav-list">
          <li className="nav-item">Feature Selection</li>
          <li className="nav-item" onClick={() => navigate("/")}>
            Attack-Metrics
          </li>
          <li
            className="nav-item"
            onClick={() => navigate("/all_data_predictions")}
          >
            Predictions
          </li>
          <li className="nav-item" onClick={() => navigate("/all_metrics")}>
            All-Metrics
          </li>
        </ul>
      </nav>

      <div>
        <button
          className="stream-button"
          onClick={handleSampling}
          disabled={load}
        >
          {load ? "Sampling..." : "Sample Dataset"}
        </button>

        <input
          type="text"
          name="value"
          placeholder=" default: 2672997"
          value={value}
          onChange={handleValueChange}
          style={{ marginRight: "20px", width: "240px", fontSize: "20px" }}
        />
      </div>

      <div>
        <button
          className="stream-button"
          onClick={handleFeatureSelection}
          disabled={loading} // Disable the button while loading
        >
          {loading ? "Running Please Wait..." : "Run Feature Selection"}
        </button>
        <select
          value={sampling}
          onChange={(e) => setSampling(e.target.value)}
          style={{ marginLeft: "1px", width: "180px", fontSize: "20px" }}
          size={1}
        >
          <option value="">Feature Type?</option>
          <option value="attack">Attack</option>
          <option value="all_data">All Data</option>
        </select>
      </div>

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

export default FeatureSelection;
