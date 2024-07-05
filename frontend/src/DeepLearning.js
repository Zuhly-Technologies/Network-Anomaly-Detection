import React, { useState, useEffect, Fragment } from "react";
import "./App.css";
import ReadOnlyRow from "./components/GSCVReadOnlyRow";
import EditableRow from "./components/GSCVEditableRow";
import AlertDialog from "./components/Modal";
import { useNavigate } from "react-router-dom";
import logo from "./zt.png";
import config from "./config";

const DeepLearning = () => {
  const [products, setProducts] = useState([]);

  const [addFormData, setAddFormData] = useState({
    id: "",
    learning_rate: "0.001,0.005",
    batch_size: "64,128",
    max_epochs: "15,30",
    layer_size: "200,500",
    layers: "2,5",
    dropout_probability: "0.1,0.2",
    active: "",
  });

  const [editFormData, setEditFormData] = useState({
    id: "",
    learning_rate_lower_limit: "",
    learning_rate_upper_limit: "",
    batch_size_lower_limit: "",
    batch_size_upper_limit: "",
    max_epochs_lower_limit: "",
    max_epochs_upper_limit: "",
    layer_size_lower_limit: "",
    layer_size_upper_limit: "",
    layers_lower_limit: "",
    layers_upper_limit: "",
    dropout_probability_lower_limit: "",
    dropout_probability_upper_limit: "",
  });

  const [tableEntries, setTableEntries] = useState({
    count_customer_profile: 0,
    count_terminal_profile: 0,
  });

  const [editDataId, setEditDataId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMessage, setGenerationMessage] = useState("");
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const [backupTableNames, setBackupTableNames] = useState([]);
  const [isGenerateButtonEnabled, setIsGenerateButtonEnabled] = useState(false);

  const handleGenerateButtonClick = () => {
    setIsGenerateButtonEnabled(true);
  };

  useEffect(() => {
    fetchBackupTableNames();
  }, []);

  const fetchBackupTableNames = () => {
    fetch(`${config.apiUrl}/get_backup_names_gscv`)
      .then((response) => response.json())
      .then((data) => setBackupTableNames(data))
      .catch((error) =>
        console.error("Error fetching backup table names:", error)
      );
  };

  const handleBackupInputChange = (event) => {
    postTable(event.target.value);
  };

  const handleOverride = () => {
    postTable();
  };

  useEffect(() => {
    // Fetch data from your API endpoint
    fetch(`${config.apiUrl}/get_deep_learning_results `)
      .then((response) => response.json())
      .then((data) => {
        console.log("Data fetched:", data); // Log the fetched data
        setProducts(data); // Set the products state
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleEditFormChange = (event) => {
    event.preventDefault();

    const fieldName = event.target.getAttribute("name");
    const fieldValue = event.target.value;

    const newFormData = { ...editFormData };
    newFormData[fieldName] = fieldValue;

    setEditFormData(newFormData);
  };

  const handleAddFormChange = (event) => {
    event.preventDefault();

    const fieldName = event.target.getAttribute("name");
    const fieldValue = event.target.value;

    const newFormData = { ...addFormData };
    newFormData[fieldName] = fieldValue;

    setAddFormData(newFormData);
  };

  const postTable = (Suffix) => {
    const newData = {
      learning_rate: addFormData.learning_rate,

      batch_size: addFormData.batch_size,

      max_epochs: addFormData.max_epochs,

      layer_size: addFormData.layer_size,

      layers: addFormData.layers,

      dropout_probability: addFormData.dropout_probability,

      suffix: Suffix,
    };

    // Sending POST request to API
    fetch(`${config.apiUrl}/deep_learning_results`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newData),
    })
      .then((response) => {
        if (response.ok) {
          return response.json(); // Parse JSON for successful responses
        } else {
          throw response; // Throw the entire response for error handling
        }
      })
      .then((responseData) => {
        setProducts([...products, responseData]);
        // Reload the page after table update
        window.location.reload();
        setGenerationMessage("Data Generated");
      })
      .catch((error) => {
        console.error("Error adding data:", error);
        error
          .json()
          .then((errorMessage) => {
            setGenerationMessage(errorMessage.error);
          })
          .catch(() => {
            setGenerationMessage("No Transformed Table");
          });
      })
      .finally(() => {
        setIsGenerating(false);
      });
  };

  const checkActiveTable = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/check_gscv_active_model`);
      const data = await response.json();
      setShowAddForm(true);
      return data.table_exists;
    } catch (error) {
      console.error("Error checking active table:", error);
      throw error;
    }
  };

  const handleAddFormSubmit = async (event) => {
    setIsGenerating(true);
    event.preventDefault();

    const a = await checkActiveTable();
    console.log("a:", a);
    if (a) {
      setOpen(true);
      return;
    }
    postTable();

    setGenerationMessage("Generating Data, this may take some time...");
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////

  const handleEditFormSubmit = (event) => {
    event.preventDefault();

    const editedProduct = {
      //user_id: editFormData.user_id,
      n_customers: editFormData.n_customers,
      n_terminals: editFormData.n_terminals,
      nb_days: editFormData.nb_days,
      start_date: editFormData.start_date,
      radius: editFormData.radius,
    };

    // Sending PATCH request to API
    fetch(`${config.apiUrl}/simulator/${editDataId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editedProduct),
    })
      .then((response) => response.json())
      .then((responseData) => {
        // Update the products state with the edited data
        const updatedProducts = products.map((data) =>
          data.id === editDataId ? responseData : data
        );
        setProducts(updatedProducts);
        setEditDataId(null);
      })
      .catch((error) => console.error("Error editing data:", error));

    const newProducts = [...products];

    const index = products.findIndex((product) => product.id === editDataId);

    newProducts[index] = editedProduct;

    setProducts(newProducts);
    setEditDataId(null);
  };

  const handleEditClick = (event, data) => {
    event.preventDefault();
    setEditDataId(data.id);

    const formValues = {
      //user_id: data.user_id,
      n_customers: data.n_customers,
      n_terminals: data.n_terminals,
      nb_days: data.nb_days,
      start_date: data.start_date,
      radius: data.radius,
    };

    setEditFormData(formValues);
  };

  const handleCancelClick = () => {
    setEditDataId(null);
  };

  ///////////////////////////////////////////////////////////////////////////////////////////

  //DELETING DATA
  const handleDeleteClick = (dataId) => {
    // Sending DELETE request to API
    fetch(`${config.apiUrl}/delete_gscv_model/${dataId}`, {
      method: "DELETE",
    })
      .then(() => {
        // Remove the deleted data from the products state
        const updatedProducts = products.filter(
          (data) => data.user_id !== dataId
        );
        setProducts(updatedProducts);
        window.location.reload();
      })
      .catch((error) => console.error("Error deleting data:", error));
  };

  const handleRestoreClick = (dataId) => {
    // Sending POST request to the restore endpoint
    fetch(`${config.apiUrl}/restore_gscv_model/${dataId}`, {
      method: "POST", // Make sure it's a POST request
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ dataId }),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Model restored successfully.");
          // Reload the page after Model update
          window.location.reload();
        } else {
          throw new Error("Model restoration failed.");
        }
      })
      .catch((error) => {
        console.error("Error restoring Model:", error);
        // Handle error scenarios here
      });
  };

  //////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    document.title = "Train Model with GridSearchCV";
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
          Train Model with GridSearchCV
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
          <li className="nav-item">Train-Model-GSCV</li>
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

      <AlertDialog
        open={open}
        setOpen={setOpen}
        handleBackupInputChange={handleBackupInputChange}
        handleOverride={handleOverride}
        backupTableNames={backupTableNames}
        onGenerateButtonClick={handleGenerateButtonClick}
      />

      <div className="form-container">
        <h2>Hyperparameters</h2>
        <strong style={{ fontSize: "20px" }}>
          Note: Input multiple paramaters seperated by a comma eg:
          0.001,0.003,0.005. Inputs not seperated by a comma will be treated as
          a single parameter.
        </strong>
        <br></br>
        <br></br>
        {/* ADD DATA */}
        <form onSubmit={handleAddFormSubmit}>
          <br />
          <div className="form-row">
            <label htmlFor="learning_rate">Learning Rate</label>
            <input
              type="text"
              name="learning_rate"
              // required="required"
              placeholder="0.001,0.005"
              className="narrow-input"
              onChange={handleAddFormChange}
            />
          </div>
          <div className="form-row">
            <label htmlFor="batch_size">Batch Size</label>
            <input
              type="text"
              name="batch_size"
              // required="required"
              placeholder="64,128"
              className="narrow-input"
              onChange={handleAddFormChange}
            />
          </div>

          <div className="form-row">
            <label htmlFor="max_epochs">Max Epochs</label>
            <input
              type="text"
              name="max_epochs"
              // required="required"
              placeholder="15,30"
              className="narrow-input"
              onChange={handleAddFormChange}
            />
          </div>

          <div className="form-row">
            <label htmlFor="layer_size">Layer Size</label>
            <input
              type="text"
              name="layer_size"
              // required="required"
              placeholder="200,500"
              className="narrow-input"
              onChange={handleAddFormChange}
            />
          </div>

          <div className="form-row">
            <label htmlFor="layers">Layers</label>
            <input
              type="text"
              name="layers"
              // required="required"
              placeholder="2,5"
              className="narrow-input"
              onChange={handleAddFormChange}
            />
          </div>

          <div className="form-row">
            <label htmlFor="dropout_probability">Dropout</label>
            <input
              type="text"
              name="dropout_probability"
              placeholder="0.1,0.2"
              // required="required"
              className="narrow-input"
              onChange={handleAddFormChange}
              // pattern="\d+(\.\d{1,2})?"
            />
          </div>

          <button
            type="submit"
            className="stream-button"
            style={{ padding: "6  px 20px", fontSize: "20px" }}
            disabled={isGenerating}
          >
            Train
          </button>
          {isGenerating && <p>Training...</p>}
          {generationMessage && !isGenerating && <p>{generationMessage}</p>}
        </form>
      </div>

      <hr />

      <form onSubmit={handleEditFormSubmit}>
        <table>
          <thead>
            <tr>
              <th>Model Id</th>

              <th>Best Learning Rate</th>

              <th>Best Batch Size </th>

              <th>Best Max Epochs</th>

              <th>Best Layer Size</th>

              <th>Best layers</th>

              <th>Best Dropout</th>

              <th>Active</th>

              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((data) => (
              <Fragment>
                {editDataId === data.id ? (
                  <EditableRow
                    product={data}
                    editFormData={editFormData}
                    handleEditFormChange={handleEditFormChange}
                    handleCancelClick={handleCancelClick}
                  />
                ) : (
                  <ReadOnlyRow
                    product={data}
                    handleEditClick={handleEditClick}
                    handleDeleteClick={handleDeleteClick}
                    handleRestoreClick={handleRestoreClick}
                  />
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </form>
    </div>
  );
};

export default DeepLearning;
