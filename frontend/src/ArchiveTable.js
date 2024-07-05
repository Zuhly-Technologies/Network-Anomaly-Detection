import React, { useState, useEffect } from "react";
import "./TransformedTable.css";
import { useNavigate } from "react-router-dom";
import logo from "./zt.png";
import "./AlertModal.css";
import config from "./config";

const ArchiveTable = () => {
  const [data, setData] = useState([]);
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();

  const columns = [
    "user_id",
    "n_customers",
    "n_terminals",
    "nb_days",
    "start_date",
    "radius",
    "total_rows",
    "fraud_percentage",
    "scenario_1",
    "scenario_2",
    "scenario_3",
    "scenario_4",
    "scenario_5",
    "scenario_6",
  ];

  const fetchData = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/get_archive`);
      const data = await response.json();
      setRows(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRestoreArchive = async (userId) => {
    try {
      const response = await fetch(
        `${config.apiUrl}/restore_archive/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        console.log("Archive restored successfully");
        window.location.reload();
        //fetchData();
      } else {
        console.error("Failed to restore archive");
      }
    } catch (error) {
      console.error("Error during restore:", error);
    }
  };

  const handleDelete = async (userId) => {
    try {
      const response = await fetch(
        `${config.apiUrl}/delete_archive/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        console.log("Archive deleted successfully");
        window.location.reload();
      } else {
        console.error("Failed to deletearchive");
      }
    } catch (error) {
      console.error("Error during deletion:", error);
    }
  };

  useEffect(() => {
    document.title = "Archive";
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
          Data Archive
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
          <li className="nav-item" onClick={() => navigate("/inference")}>
            Inference
          </li>
          <li className="nav-item" onClick={() => navigate("/autoencoder")}>
            Autoencoder-Metrics
          </li>
          <li className="nav-item">Archives</li>
        </ul>
      </nav>

      <div style={{ width: "100%", overflowX: "scroll" }}>
        <table>
          <thead>
            <tr>
              <th>Transaction Id</th>
              <th>Customers</th>
              <th>Terminals</th>
              <th>Days</th>
              <th>Start Date</th>
              <th>Radius</th>
              <th>Records</th>
              <th>Fraud %</th>
              <th>Scenario 1</th>
              <th>Scenario 2</th>
              <th>Scenario 3</th>
              <th>Scenario 4</th>
              <th>Scenario 5</th>
              <th>Scenario 6</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.length > 0 ? (
              rows.map((d) => (
                <tr key={d[columns[0]]}>
                  <td>{d[columns[0]]}</td>
                  <td>{d[columns[1]]}</td>
                  <td>{d[columns[2]]}</td>
                  <td>{d[columns[3]]}</td>
                  <td>{d[columns[4]]}</td>
                  <td>{d[columns[5]]}</td>
                  <td>{d[columns[6]]}</td>
                  <td>{d[columns[7]]}</td>
                  <td>{d[columns[8]]}</td>
                  <td>{d[columns[9]]}</td>
                  <td>{d[columns[10]]}</td>
                  <td>{d[columns[11]]}</td>
                  <td>{d[columns[12]]}</td>
                  <td>{d[columns[13]]}</td>
                  <td>
                    <div className="button-container">
                      <button
                        className="stream-button large-button" // Add a class for styling
                        onClick={() => handleRestoreArchive(d[columns[0]])}
                      >
                        Restore
                      </button>
                      <button
                        className="stream-button large-button" // Add a class for styling
                        onClick={() => handleDelete(d[columns[0]])}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
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
    </div>
  );
};
export default ArchiveTable;
