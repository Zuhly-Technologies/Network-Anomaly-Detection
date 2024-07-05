import React, { useState, useEffect } from "react";
import "./TransformedTable.css";
import { useNavigate } from "react-router-dom";
import CustomerModal from "./CustomerModal";
import logo from "./zt.png";
import "./AlertModal.css";
import config from "./config";

const Results = () => {
  const [data, setData] = useState([]);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [CustomerData, setCustomerData] = useState();
  const [open, setOpen] = useState(false);
  const [sortBy, setSortBy] = useState(""); // State to hold the selected sorting option
  const [column, setColumn] = useState("");
  const [operator, setOperator] = useState("");
  const [value, setValue] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [sampling, setSampling] = useState("");

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
    "Logistic_regression_FRAUD_PREDICTED",
    "Decision_tree_depth_two_FRAUD_PREDICTED",
    "Decision_tree_unlimited_depth_FRAUD_PREDICTED",
    "Random_forest_FRAUD_PREDICTED",
    "XGBoost_FRAUD_PREDICTED",
  ];

  const limit = 10;
  const table = 2;

  const fetchData = async (limit, page) => {
    const res = await fetch(
      `${config.apiUrl}/result/limit/${limit}/page/${page}`
    );
    const json = await res.json();
    setData(JSON.parse(json));
    setRows(JSON.parse(json));
  };

  const handleNext = async () => {
    const nextPage = page + 1;
    const res = await fetch(
      `${config.apiUrl}/result/limit/${limit}/page/${nextPage}`
    );
    const json = await res.json();
    setRows(JSON.parse(json));
    setPage(nextPage);
  };

  const handlePrevious = async () => {
    const previousPage = page - 1;
    if (previousPage > 0) {
      const res = await fetch(
        `${config.apiUrl}/result/limit/${limit}/page/${previousPage}`
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
    const res = await fetch(`${config.apiUrl}/result/limit/${limit}/page/1`);
    const json = await res.json();
    setRows(JSON.parse(json));
    setPage(1);
  };

  const handleLastPage = async () => {
    const res = await fetch(
      `${config.apiUrl}/getall_pages/limit/${limit}/table/${table}`
    );
    const pageInfo = await res.json();

    let lastPage = pageInfo.total_pages;
    console.log(lastPage);

    const resData = await fetch(
      `${config.apiUrl}/result/limit/${limit}/page/${lastPage}`
    );
    const jsonData = await resData.json();

    setRows(JSON.parse(jsonData));
    setPage(lastPage);
  };

  const handlePrediction = async () => {
    if (sampling) {
      try {
        setLoading(true);

        const response = await fetch(
          `${config.apiUrl}/prediction/${sampling}`,
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

  const handleOpenModal = async (id, column) => {
    let res;
    setOpen(true);

    if (column === 2) {
      res = await fetch(`${config.apiUrl}/customer_transactions/${id}`);
      res = await res.json();
      setCustomerData(JSON.parse(res));
    }
    if (column === 3) {
      res = await fetch(`${config.apiUrl}/terminal_transactions/${id}`);
      res = await res.json();
      setCustomerData(JSON.parse(res));
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/delete_predicted`, {
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

  const handleSortBy = async () => {
    if (sortBy) {
      console.log(sortBy);
      const res = await fetch(`${config.apiUrl}/sort/${sortBy}`);
      window.location.reload();
    }
  };

  const handleFilterBy = async () => {
    if (column && operator && value) {
      console.log(column, operator, value);
      const res = await fetch(
        `${config.apiUrl}/filtered_transactions/${column}/${operator}/${value}`
      );
      window.location.reload();
    }
  };

  const color = (fraud) => (fraud === 1 ? "red" : "");

  useEffect(() => {
    document.title = "Predictions";
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
          Predictions
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
          onClick={handlePrediction}
          disabled={loading} // Disable the button while loading
        >
          {loading ? "Generating..." : "Generate Predictions"}
        </button>
        <select
          value={sampling}
          onChange={(e) => setSampling(e.target.value)}
          style={{ marginLeft: "1px", width: "180px", fontSize: "20px" }}
          size={1}
        >
          <option value="">Select Sampling</option>
          {/* <option value="default">default</option> */}
          <option value="none">None</option>
          <option value="smoteenn">SMOTEENN</option>
          <option value="undersample">Undersample</option>
        </select>
      </div>

      <div>
        <button
          className="stream-button"
          onClick={handleSortBy}
          disabled={!sortBy} // Disable the button if no option is selected
        >
          Sort by
        </button>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ marginRight: "20px", width: "180px", fontSize: "20px" }}
          size={1}
        >
          <option value="">Select an option</option>
          <option value="default">default</option>
          <option value="TRANSACTION_ID">Transaction ID</option>
          <option value="TX_FRAUD">Fraud</option>
          <option value="Logistic_regression_FRAUD_PREDICTED">
            Logistic Regression
          </option>
          <option value="Decision_tree_depth_two_FRAUD_PREDICTED">
            Decision Tree Depth Two
          </option>
          <option value="Decision_tree_unlimited_depth_FRAUD_PREDICTED">
            Decision Tree Unlimited Depth
          </option>
          <option value="Random_forest_FRAUD_PREDICTED">Random Forest</option>
          <option value="XGBoost_FRAUD_PREDICTED">XGBoost</option>
        </select>
      </div>
      <div>
        <button
          className="stream-button"
          onClick={handleFilterBy}
          disabled={!column || !operator || !value} // Disable the button if no option is selected
        >
          Filter by
        </button>
        <select
          value={column}
          onChange={(e) => setColumn(e.target.value)}
          style={{ marginRight: "1px", width: "173px", fontSize: "20px" }}
          size={1}
        >
          <option value="">Select an option</option>
          <option value="TRANSACTION_ID">Transaction ID</option>
          <option value="TX_CATEGORY">Category</option>
          <option value="TX_FRAUD">Fraud</option>
          <option value="Logistic_regression_FRAUD_PREDICTED">
            Logistic Regression
          </option>
          <option value="Decision_tree_depth_two_FRAUD_PREDICTED">
            Decision Tree Depth Two
          </option>
          <option value="Decision_tree_unlimited_depth_FRAUD_PREDICTED">
            Decision Tree Unlimited Depth
          </option>
          <option value="Random_forest_FRAUD_PREDICTED">Random Forest</option>
          <option value="XGBoost_FRAUD_PREDICTED">XGBoost</option>
        </select>
        <select
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
          style={{ marginRight: "1px", width: "173px", fontSize: "20px" }}
          size={1}
        >
          <option value="">Select an option</option>
          <option value="=">Equal to</option>
          <option value="<=">Less than Equal to</option>
          <option value=">=">Greater than Equal to</option>
          <option value=">">Greater than</option>
          <option value="<">Less than</option>
        </select>
        <input
          type="text"
          name="value"
          placeholder=" value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ marginRight: "20px", width: "240px", fontSize: "20px" }}
        />
      </div>

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
          style={{ float: "right", width: "200px", marginLeft: "1000px" }}
          onClick={handleDelete}
        >
          Delete
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
              <th>Transaction ID</th>
              <th>Date Time</th>
              <th>Customer ID</th>
              <th>Terminal ID</th>
              <th>Amount</th>
              <th>Seconds</th>
              <th>Days</th>
              <th>Category</th>
              <th>Fraud</th>
              <th>Scenarios</th>
              <th>Logistic Regression</th>
              <th>
                Decision Tree <br />
                Depth Two
              </th>
              <th>
                Decision Tree <br />
                Unlimited Depth
              </th>
              <th>Random Forest</th>
              <th>XGBoost</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((d, i) => (
                <tr
                  key={i}
                  style={{
                    color: color(d[columns[8]]),
                  }}
                >
                  <td>{d[columns[0]]}</td>
                  <td>{d[columns[1]]}</td>
                  <td
                    className="link"
                    onClick={() => handleOpenModal(d[columns[2]], 2)}
                  >
                    {d[columns[2]]}
                  </td>
                  <td
                    className="link"
                    onClick={() => handleOpenModal(d[columns[3]], 3)}
                  >
                    {d[columns[3]]}
                  </td>
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
      <strong style={{ fontSize: "20px" }}>
        Default: Automatically selects sampling technique based on fraud
        precentage
      </strong>
      <strong style={{ fontSize: "20px" }}>
        SMOTEENN: A combination of SMOTE (oversampling) and Edited Nearest
        Neighbor (ENN) method
      </strong>
      <strong style={{ fontSize: "20px" }}>
        Undersample: Randomly delete examples in the majority class from
        training data.
      </strong>
      <strong style={{ fontSize: "20px" }}>
        None: Does not perform any sampling
      </strong>
      <CustomerModal
        open={open}
        setOpen={setOpen}
        rows={CustomerData}
        setRows={setCustomerData}
      />
    </div>
  );
};
export default Results;
