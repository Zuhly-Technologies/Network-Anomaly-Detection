import React, { useState, useEffect } from "react";
import "./TransformedTable.css";
import { useNavigate } from "react-router-dom";
import logo from "./zt.png";
import ConfusionMatrix from "./ConfusionMatrixModal";
import config from "./config";

const ThresholdBasedMetrics = () => {
  const [data, setData] = useState([]);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [model, setModel] = useState("");
  const [Matrix, setMatrix] = useState();
  const [open, setOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [optimalTB, setOptimalTB] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [column, setColumn] = useState("");
  const [operator, setOperator] = useState("");
  const [value, setValue] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const columns = [
    "Threshold",
    "MME",
    "TPR",
    "TNR",
    "FPR",
    "FNR",
    "BER",
    "G-mean",
    "Precision",
    "Accuracy",
    "NPV",
    "FDR",
    "FOR",
    "F1 Score",
  ];

  const limit = 10;
  const table = 5;

  useEffect(() => {
    // Retrieve the selected model from localStorage on component mount
    const storedModel = localStorage.getItem("selectedModel");
    if (storedModel) {
      setSelectedModel(storedModel);
    }

    const storedThreshold = localStorage.getItem("optimalTB");
    if (storedThreshold) {
      setOptimalTB(storedThreshold);
    }

    fetchData(limit, page);
  }, [page]);

  const fetchData = async (limit, page) => {
    const res = await fetch(
      `${config.apiUrl}/metrics/limit/${limit}/page/${page}`
    );
    const json = await res.json();
    setData(JSON.parse(json));
    setRows(JSON.parse(json));
  };

  const handleNext = async () => {
    const nextPage = page + 1;
    const res = await fetch(
      `${config.apiUrl}/metrics/limit/${limit}/page/${nextPage}`
    );
    const json = await res.json();
    setRows(JSON.parse(json));
    setPage(nextPage);
  };

  const handlePrevious = async () => {
    const previousPage = page - 1;
    if (previousPage > 0) {
      const res = await fetch(
        `${config.apiUrl}/metrics/limit/${limit}/page/${previousPage}`
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
    const res = await fetch(`${config.apiUrl}/metrics/limit/${limit}/page/1`);
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
      `${config.apiUrl}/metrics/limit/${limit}/page/${lastPage}`
    );
    const jsonData = await resData.json();

    setRows(JSON.parse(jsonData));
    setPage(lastPage);
  };

  const handleGenerateMetrics = async () => {
    if (model) {
      setLoading(true);
      const res = await fetch(`${config.apiUrl}/generate_metrics/${model}`);

      if (res.ok) {
        const json = await res.json();
        setLoading(false);
        setSelectedModel(model);
        localStorage.setItem("selectedModel", model);
        setOptimalTB(json);
        localStorage.setItem("optimalTB", json);
        window.location.reload();
      } else if (res.status === 404) {
        // No predictions available
        setShowAlert(true);
      } else {
        // Prediction failed
        console.error("Error generating predictions");
      }
    }
  };

  const handleOpenModal = async (threshold) => {
    let res;
    setOpen(true);

    res = await fetch(`${config.apiUrl}/confusion_matrix/${threshold}`);
    res = await res.json();
    setMatrix(JSON.parse(res));
  };

  const handleSortBy = async () => {
    if (sortBy) {
      console.log(sortBy);
      const res = await fetch(`${config.apiUrl}/sort_metrics/${sortBy}`);
      window.location.reload();
    }
  };

  const handleFilterBy = async () => {
    if (column && operator && value) {
      console.log(column, operator, value);
      const res = await fetch(
        `${config.apiUrl}/filter_metrics/${column}/${operator}/${value}`
      );
      window.location.reload();
    }
  };

  useEffect(() => {
    document.title = "Threshold Based Metrics";
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
          Threshold Based Metrics
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
          <li className="nav-item">TB-Metrics</li>
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

      <div style={{ marginTop: "10px", fontSize: "25px" }}>
        <strong>Model used for generating current metrics:</strong>{" "}
        {selectedModel && selectedModel.replace(/_FRAUD_PREDICTED$/, "")}
      </div>

      <div style={{ marginTop: "10px", fontSize: "25px" }}>
        <strong>Optimal Threshold:</strong> {optimalTB}
      </div>

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
          disabled={!model || loading} // Disable the button if no option is selected
        >
          {loading ? "Generating..." : "Generate Metrics"}
        </button>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          style={{ marginLeft: "00px", width: "180px", fontSize: "19px" }}
          size={1}
        >
          <option value="">Select an option</option>
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
          <option value="MME"> MME</option>
          <option value="TPR">Recall</option>
          <option value="TNR">TNR</option>
          <option value="FPR">FPR</option>
          <option value="FNR">FNR</option>
          <option value="BER"> BER</option>
          <option value="G-mean">G-mean</option>
          <option value="Precision">Precision</option>
          <option value="Accuracy">Accuracy</option>
          <option value="NPV">NPV</option>
          <option value="FDR">FDR</option>
          <option value="FOR">FOR</option>
          <option value="F1 Score">F1 Score</option>
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
          <option value="MME"> MME</option>
          <option value="TPR">Recall</option>
          <option value="TNR">TNR</option>
          <option value="FPR">FPR</option>
          <option value="FNR">FNR</option>
          <option value="BER"> BER</option>
          <option value="G-mean">G-mean</option>
          <option value="Precision">Precision</option>
          <option value="Accuracy">Accuracy</option>
          <option value="NPV">NPV</option>
          <option value="FDR">FDR</option>
          <option value="FOR">FOR</option>
          <option value="F1 Score">F1 Score</option>
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
      </div>

      <div style={{ width: "100%", overflowX: "scroll" }}>
        <table>
          <thead>
            <tr>
              <th>Threshold</th>
              <th>MME</th>
              <th>Recall</th>
              <th>TNR</th>
              <th>FPR</th>
              <th>FNR</th>
              <th>BER</th>
              <th>G-mean</th>
              <th>Precision</th>
              <th>Accuracy</th>
              <th>NPV</th>
              <th>FDR</th>
              <th>FOR</th>
              <th>F1 Score</th>
              <th>
                Confusion <br /> Matrix
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((d) => (
                <tr>
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
                    <button
                      className="stream-button"
                      onClick={() => handleOpenModal(d[columns[0]])}
                    >
                      View
                    </button>
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
      <ConfusionMatrix
        open={open}
        setOpen={setOpen}
        rows={Matrix}
        setRows={setMatrix}
      />
    </div>
  );
};
export default ThresholdBasedMetrics;
