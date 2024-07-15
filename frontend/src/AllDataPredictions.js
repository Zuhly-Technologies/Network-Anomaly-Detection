import React, { useState, useEffect } from "react";
import "./TransformedTable.css";
import { useNavigate } from "react-router-dom";
// import CustomerModal from "./CustomerModal";
import CustomerDataModal from "./CustomerDataModal";
import logo from "./zt.png";
import "./AlertModal.css";
import config from "./config";

const AllDataPredictions = () => {
  const [data, setData] = useState([]);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [CustomerData, setCustomerData] = useState();
  const [open, setOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [sortBy, setSortBy] = useState(""); // State to hold the selected sorting option
  const [column, setColumn] = useState("");
  const [operator, setOperator] = useState("");
  const [value, setValue] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [sampling, setSampling] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [terminalId, setTerminalId] = useState("");
  const [Amount, setAmount] = useState("");
  const [Fraud, setFraud] = useState("");

  const columns = [
    "index",
    "Flow Duration",
    "Total Fwd Packets",
    "Total Backward Packets",
    "Total Length of Fwd Packets",
    "Total Length of Bwd Packets",
    "Fwd Packet Length Max",
    "Fwd Packet Length Min",
    "Fwd Packet Length Mean",
    "Fwd Packet Length Std",
    "Bwd Packet Length Max",
    "Bwd Packet Length Mean",
    "Bwd Packet Length Std",
    "Flow Bytes/s",
    "Flow IAT Mean",
    "Flow IAT Std",
    "Flow IAT Max",
    "Flow IAT Min",
    "Fwd IAT Total",
    "Label",
    "Naive Bayes",
    "QDA",
    "Random Forest",
    "ID3",
  ];

  const limit = 10;
  const table = 1;

  const fetchData = async (limit, page) => {
    const res = await fetch(
      `${config.apiUrl}/get_all_predictions/limit/${limit}/page/${page}`
    );
    const json = await res.json();
    setData(JSON.parse(json));
    setRows(JSON.parse(json));
  };

  const handleNext = async () => {
    const nextPage = page + 1;
    const res = await fetch(
      `${config.apiUrl}/get_all_predictions/limit/${limit}/page/${nextPage}`
    );
    const json = await res.json();
    setRows(JSON.parse(json));
    setPage(nextPage);
  };

  const handlePrevious = async () => {
    const previousPage = page - 1;
    if (previousPage > 0) {
      const res = await fetch(
        `${config.apiUrl}/get_all_predictions/limit/${limit}/page/${previousPage}`
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
      `${config.apiUrl}/get_all_predictions/limit/${limit}/page/1`
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

    let lastPage = pageInfo.total_pages;
    console.log(lastPage);

    const resData = await fetch(
      `${config.apiUrl}/get_all_predictions/limit/${limit}/page/${lastPage}`
    );
    const jsonData = await resData.json();

    setRows(JSON.parse(jsonData));
    setPage(lastPage);
  };

  const handlePrediction = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${config.apiUrl}/generate_all_data_predictions`,
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
  };

  const handleOpenModal = async (
    id,
    column,
    txId,
    TerminalId,
    amount,
    fraud
  ) => {
    let res;

    if (column === 2) {
      setOpen(true);
      res = await fetch(`${config.apiUrl}/customer_transactions/${id}`);
      res = await res.json();
      setCustomerData(JSON.parse(res));
    }
    if (column === 3) {
      setOpen(true);
      res = await fetch(`${config.apiUrl}/terminal_transactions/${id}`);
      res = await res.json();
      setCustomerData(JSON.parse(res));
    }
    if (column === 4) {
      setOpenModal(true);
      res = await fetch(`${config.apiUrl}/customer_data/${id}`);
      res = await res.json();
      setCustomerData(JSON.parse(res));
      setTransactionId(txId);
      setTerminalId(TerminalId);
      setAmount(amount);
      setFraud(fraud);
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

  const color = (Label) => (Label === 1 ? "red" : "");

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
          <li
            className="nav-item"
            onClick={() => navigate("/feature_selection")}
          >
            Feature Selection
          </li>
          <li className="nav-item" onClick={() => navigate("/")}>
            Attack-Metrics
          </li>
          <li className="nav-item">Predictions</li>
          <li className="nav-item" onClick={() => navigate("/all_metrics")}>
            All-Metrics
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
      </div>

      {/* <div>
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
          <option value="none">None</option>
          <option value="smoteenn">SMOTEENN</option>
          <option value="undersample">Undersample</option>
        </select>
      </div> */}

      {/* <div>
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
      </div> */}

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
              <th>Index</th>
              <th>Flow Duration</th>
              <th>Total Fwd Packets</th>
              <th>Total Backward Packets</th>
              <th>Total Length of Fwd Packets</th>
              <th>Total Length of Bwd Packets</th>
              <th>Fwd Packet Length Max</th>
              <th>Fwd Packet Length Min</th>
              <th>Fwd Packet Length Mean</th>
              <th>Fwd Packet Length Std</th>
              <th>Bwd Packet Length Max</th>
              <th>Bwd Packet Length Mean</th>
              <th>Bwd Packet Length Std</th>
              <th>Flow Bytes/s</th>
              <th>Flow IAT Mean</th>
              <th>Flow IAT Std</th>
              <th>Flow IAT Max</th>
              <th>Flow IAT Min</th>
              <th>Fwd IAT Total</th>
              <th>Label</th>
              <th>Naive Bayes</th>
              <th>QDA</th>
              <th>Random Forest</th>
              <th>ID3</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((d, i) => (
                <tr
                  key={i}
                  style={{
                    color: color(d[columns[19]]),
                  }}
                >
                  {/* <td>{d[columns[0]]}</td> */}
                  <td
                    className="link"
                    onClick={() =>
                      handleOpenModal(
                        d[columns[2]],
                        4,
                        d[columns[0]],
                        d[columns[3]],
                        d[columns[4]],
                        d[columns[8]]
                      )
                    }
                  >
                    {d[columns[0]]}
                  </td>
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
                  <td>{d[columns[17]]}</td>
                  <td>{d[columns[18]]}</td>
                  <td>{d[columns[19]]}</td>
                  <td>{d[columns[20]]}</td>
                  <td>{d[columns[21]]}</td>
                  <td>{d[columns[22]]}</td>
                  <td>{d[columns[23]]}</td>
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

      <CustomerDataModal
        open={openModal}
        setOpen={setOpenModal}
        rows={CustomerData}
        setRows={setCustomerData}
        txId={transactionId}
        transactionId={setTransactionId}
        TerminalId={terminalId}
        terminalId={setTerminalId}
        amount={Amount}
        Amount={setAmount}
        fraud={Fraud}
        Fraud={setFraud}
      />
    </div>
  );
};
export default AllDataPredictions;
