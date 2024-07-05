import React, { useRef, useState, useEffect } from "react";
import "./TransformedTable.css";
import { useNavigate } from "react-router-dom";
import CustomerModal from "./CustomerModal";
import logo from "./zt.png";
import "./AlertModal.css";
import config from "./config";

const Ensemble = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [CustomerData, setCustomerData] = useState();
  const [open, setOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [sampling, setSampling] = useState("");
  const [tfSelectedClassifier, settfSelectedClassifier] = useState("");
  const [trainData, setTrainData] = useState([]);
  const [testData, setTestData] = useState([]);
  const [imagePath, setImagePath] = useState("");

  const columns = [
    "column",
    "AUC ROC",
    "Average precision",
    "Card Precision@100",
  ];

  useEffect(() => {
    // Retrieve the selected model from localStorage on component mount
    const TfStoredClassifier = localStorage.getItem("tfSelectedClassifier");
    if (TfStoredClassifier) {
      settfSelectedClassifier(TfStoredClassifier);
    }

    setImagePath(`${config.apiUrl}/get_plot/${TfStoredClassifier}`);

    fetchData();
    // fetchTrain();
    // fetchTest();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/get_ensemble`);
      const json = await res.json();

      const parsedData = JSON.parse(json);
      console.log(parsedData);

      // Always update the rows data
      setRows(parsedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchTrain = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/get_train_df`);
      const json = await res.json();

      // Assuming your API returns an array of objects with "Threshold", "ROC_TPR", and "ROC_FPR" properties
      const parsedData = JSON.parse(json);
      // console.log("TRAIN", parsedData);

      // Check if the rocData state is empty before setting it
      if (trainData.length === 0) {
        setTrainData(parsedData);
      }

      // Always update the rows data
      // setRows(parsedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchTest = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/get_test_df`);
      const json = await res.json();

      // Assuming your API returns an array of objects with "Threshold", "ROC_TPR", and "ROC_FPR" properties
      const parsedData = JSON.parse(json);
      // console.log("TEST", parsedData);

      // Check if the rocData state is empty before setting it
      if (testData.length === 0) {
        setTestData(parsedData);
      }

      // Always update the rows data
      // setRows(parsedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // useEffect(() => {
  //   // Update image path based on the selected classifier
  //   if (sampling) {
  //     console.log(tfSelectedClassifier);
  //     setImagePath(`${config.apiUrl}/get_plot/${sampling}`);
  //   }
  //   // Fetch other data as necessary if required
  //   // fetchData();
  // }, [sampling]);

  const handlePrediction = async () => {
    if (sampling) {
      try {
        setLoading(true);

        const response = await fetch(`${config.apiUrl}/ensemble/${sampling}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          // Prediction successful
          settfSelectedClassifier(sampling);
          localStorage.setItem("tfSelectedClassifier", sampling);
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

  // useEffect(() => {
  //   // Assume the image does not change or is not dependent on other state
  //   setImagePath(`${config.apiUrl}/get_plot/${sampling}`);

  //   // Fetch other data as necessary
  //   fetchData();
  // }, []);

  useEffect(() => {
    document.title = "Ensemble";
  }, []);

  return (
    <div className="app-container">
      <div>
        <img
          src={logo}
          alt="Logo"
          style={{ height: "150px", marginRight: "50px" }}
        />

        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Ensemble</h1>
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
          <li className="nav-item">Ensemble</li>
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
          {loading ? "Generating..." : "Generate Results"}
        </button>
        <select
          value={sampling}
          onChange={(e) => setSampling(e.target.value)}
          style={{ marginLeft: "1px", width: "180px", fontSize: "20px" }}
          size={1}
        >
          <option value="">Select Classifier</option>
          <option value="bagging">Bagging</option>
          <option value="random_forest">Random Forest</option>
          <option value="xgboost">XGBoost</option>
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

      <div style={{ marginTop: "10px", fontSize: "25px" }}>
        <strong>Classifier used for generating current results:</strong>{" "}
        {tfSelectedClassifier}
      </div>

      <div style={{ width: "100%", overflowX: "scroll" }}>
        <table>
          <thead>
            <tr>
              <th></th>
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
      <div style={{ marginTop: "10px", fontSize: "25px" }}>
        <strong>Scatter Plots:</strong>
      </div>
      <div>
        <img
          src={imagePath}
          alt="Scatter Plot"
          style={{
            display: "block", // Makes the image a block-level element
            marginLeft: "auto", // Automatically adjust the left margin
            marginRight: "auto", // Automatically adjust the right margin
            width: "100%", // Responsive width
            maxWidth: "1700px", // Maximum width of the image
            height: "auto", // Maintain aspect ratio
          }}
        />
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
export default Ensemble;
