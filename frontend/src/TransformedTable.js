import React, { useState, useEffect } from "react";
import "./TransformedTable.css";
import { useNavigate } from "react-router-dom";
import logo from "./zt.png";
import "./AlertModal.css";
import config from "./config";

const TransformedTable = () => {
  const [data, setData] = useState([]);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);

  const columns = [
    "TRANSACTION_ID",
    "TX_DATETIME",
    "CUSTOMER_ID",
    "TERMINAL_ID",
    "TX_AMOUNT",
    "TX_TIME_SECONDS",
    "TX_TIME_DAYS",
    "TX_CATEGORY",
    "TX_FRAUD",
    "TX_FRAUD_SCENARIO",
    "TX_DURING_WEEKEND",
    "TX_DURING_NIGHT",
    "CUSTOMER_ID_NB_TX_1DAY_WINDOW",
    "CUSTOMER_ID_AVG_AMOUNT_1DAY_WINDOW",
    "CUSTOMER_ID_NB_TX_7DAY_WINDOW",
    "CUSTOMER_ID_AVG_AMOUNT_7DAY_WINDOW",
    "CUSTOMER_ID_NB_TX_30DAY_WINDOW",
    "CUSTOMER_ID_AVG_AMOUNT_30DAY_WINDOW",
    "TERMINAL_ID_NB_TX_1DAY_WINDOW",
    "TERMINAL_ID_RISK_1DAY_WINDOW",
    "TERMINAL_ID_NB_TX_7DAY_WINDOW",
    "TERMINAL_ID_RISK_7DAY_WINDOW",
    "TERMINAL_ID_NB_TX_30DAY_WINDOW",
    "TERMINAL_ID_RISK_30DAY_WINDOW",
    "TERMINAL_ID_CATEGORY_FREQUENCY_1DAY_WINDOW",
    "TERMINAL_ID_CATEGORY_FREQUENCY_7DAY_WINDOW",
    "TERMINAL_ID_CATEGORY_FREQUENCY_30DAY_WINDOW",
    "CUSTOMER_ID_CATEGORY_FREQUENCY_1DAY_WINDOW",
    "CUSTOMER_ID_CATEGORY_FREQUENCY_7DAY_WINDOW",
    "CUSTOMER_ID_CATEGORY_FREQUENCY_30DAY_WINDOW",
    "TX_CATEGORY_RISK",
  ];

  const limit = 10;
  const table = 1;

  const fetchData = async (limit, page) => {
    const res = await fetch(
      `${config.apiUrl}/transformed_table/limit/${limit}/page/${page}`
    );
    const json = await res.json();
    setData(JSON.parse(json));
    setRows(JSON.parse(json));
  };

  const handleNext = async () => {
    const nextPage = page + 1;
    const res = await fetch(
      `${config.apiUrl}/transformed_table/limit/${limit}/page/${nextPage}`
    );
    const json = await res.json();
    setRows(JSON.parse(json));
    setPage(nextPage);
  };

  const handlePrevious = async () => {
    const previousPage = page - 1;
    if (previousPage > 0) {
      const res = await fetch(
        `${config.apiUrl}/transformed_table/limit/${limit}/page/${previousPage}`
      );
      const json = await res.json();
      setRows(JSON.parse(json));
      setPage(previousPage);
    }
  };

  useEffect(() => {
    fetchData(limit, page);
  }, [page]);

  const handleFirstPage = async () => {
    const res = await fetch(
      `${config.apiUrl}/transformed_table/limit/${limit}/page/1`
    );
    const json = await res.json();
    setRows(JSON.parse(json));
    setPage(1);
  };

  const handleLastPage = async () => {
    const res = await fetch(
      `${config.apiUrl}/getall_pages/limit/${limit}/table/${table}`
    );
    const pageInfo = await res.json();

    const lastPage = pageInfo.total_pages;
    const resData = await fetch(
      `${config.apiUrl}/transformed_table/limit/${limit}/page/${lastPage}`
    );
    const jsonData = await resData.json();

    setRows(JSON.parse(jsonData));
    setPage(lastPage);
  };

  const handleTransform = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/transform_data`, {
        method: "POST",
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

  const handleDelete = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/delete_transformed`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Deletion successful
        console.log("Data deleted successfully");
        // Optionally, you can also reload the page or update the state after deletion
        window.location.reload();
      } else {
        // Deletion failed
        console.error("Error deleting data");
      }
    } catch (error) {
      console.error("Error deleting data", error);
    }
  };

  useEffect(() => {
    document.title = "Transform Active Table";
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
          Feature Engineered Data
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
          <li className="nav-item">Transformed Table</li>
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
        <button className="stream-button" onClick={handleFirstPage}>
          {"<< "} First Page
        </button>
        <button className="stream-button" onClick={handlePrevious}>
          {"< "}Previous Page
        </button>
        <button className="stream-button" onClick={handleNext}>
          Next Page{" >"}
        </button>
        <button className="stream-button" onClick={handleLastPage}>
          Last Page{" >>"}
        </button>
        <button
          className="stream-button"
          style={{ float: "right" }}
          onClick={handleTransform}
          disabled={loading} // Disable the button while loading
        >
          {loading ? "Transforming..." : "Transform Active Table"}
        </button>
        <button
          className="stream-button"
          style={{ float: "right" }}
          onClick={handleDelete}
        >
          Delete
        </button>
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

      <div style={{ width: "100%", overflowX: "scroll" }}>
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>DateTime</th>
              <th>Customer ID</th>
              <th>Terminal ID</th>
              <th>Amount</th>
              <th>Seconds</th>
              <th>Days</th>
              <th>Category</th>
              <th>Fraud</th>
              <th>Scenarios</th>
              <th>During Weekend</th>
              <th>During Night</th>
              <th>
                Customer TX <br />
                for 1 Day
              </th>
              <th>
                Customer Avg <br />
                for 1 Day
              </th>
              <th>
                Customer TX <br />
                for 7 Days
              </th>
              <th>
                Customer Avg <br />
                for 7 Days
              </th>
              <th>
                Customer TX <br />
                for 30 Day
              </th>
              <th>
                Customer Avg <br />
                for 30 Days
              </th>
              <th>
                Terminal TX <br />
                for 1 Day
              </th>
              <th>
                Terminal Risk <br />
                for 1 Day
              </th>
              <th>
                Terminal TX <br />
                for 7 Day
              </th>
              <th>
                Terminal Risk <br />
                for 7 Day
              </th>
              <th>
                Terminal TX <br />
                for 30 Day
              </th>
              <th>
                Terminal Risk <br />
                for 30 Day
              </th>
              <th>
                Terminal Category <br />
                Frequency for 1 Day
              </th>
              <th>
                Terminal Category <br />
                Frequency for 7 Days
              </th>
              <th>
                Terminal Category <br />
                Frequency for 30 Days
              </th>
              <th>
                Customer Category <br />
                Frequency for 1 Day
              </th>
              <th>
                Customer Category <br />
                Frequency for 7 Days
              </th>
              <th>
                Customer Category <br />
                Frequency for 30 Days
              </th>
              <th>Category Risk</th>
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
                  <td>{d[columns[14]]}</td>
                  <td>{d[columns[15]]}</td>
                  <td>{d[columns[16]]}</td>
                  <td>{d[columns[16]]}</td>
                  <td>{d[columns[18]]}</td>
                  <td>{d[columns[19]]}</td>
                  <td>{d[columns[20]]}</td>
                  <td>{d[columns[21]]}</td>
                  <td>{d[columns[22]]}</td>
                  <td>{d[columns[23]]}</td>
                  <td>{d[columns[24]]}</td>
                  <td>{d[columns[25]]}</td>
                  <td>{d[columns[26]]}</td>
                  <td>{d[columns[27]]}</td>
                  <td>{d[columns[28]]}</td>
                  <td>{d[columns[29]]}</td>
                  <td>{d[columns[30]]}</td>
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
export default TransformedTable;
