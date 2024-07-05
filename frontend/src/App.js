import React, { useState, useEffect, Fragment } from "react";
import "./App.css";
import ReadOnlyRow from "./components/ReadOnlyRow";
import EditableRow from "./components/EditableRow";
import AlertDialog from "./components/Modal";
import { useNavigate } from "react-router-dom";
import logo from "./zt.png";
import config from "./config";

const App = () => {
  const [products, setProducts] = useState([]);
  const [modify, setModify] = useState([]);

  const [addFormData, setAddFormData] = useState({
    user_id: "",
    n_customers: "",
    n_terminals: "",
    nb_days: "",
    start_date: "",
    radius: "",
    suffix: "",
    active: "",
    fraud_percentage: "1",
    scenario_1: "16.67",
    scenario_2: "16.67",
    scenario_3: "16.67",
    scenario_4: "16.67",
    scenario_5: "16.67",
    scenario_6: "16.67",
  });

  const [editFormData, setEditFormData] = useState({
    user_id: "",
    n_customers: "",
    n_terminals: "",
    nb_days: "",
    start_date: "",
    radius: "",
    backup_name: "",
  });

  const [tableEntries, setTableEntries] = useState({
    count_customer_profile: 0,
    count_terminal_profile: 0,
  });

  const [ModifyFraudData, setModifyFraudData] = useState({
    fraud_percentage: "1",
    scenario_1: "16.67",
    scenario_2: "16.67",
    scenario_3: "16.67",
    scenario_4: "16.67",
    scenario_5: "16.67",
    scenario_6: "16.67",
  });

  const [editDataId, setEditDataId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [generationMessage, setGenerationMessage] = useState("");
  const [modifyMessage, setmodifyMessage] = useState("");
  const [open, setOpen] = React.useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRegen, setIsRegen] = useState(false);
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
    fetch(`${config.apiUrl}/get_backup_names`)
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
    fetch(`${config.apiUrl}/simulator`)
      .then((response) => response.json())
      .then((data) => setProducts(data))
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
      n_customers: addFormData.n_customers,
      n_terminals: addFormData.n_terminals,
      nb_days: addFormData.nb_days,
      start_date: addFormData.start_date,
      radius: addFormData.radius,
      suffix: Suffix,
      fraud_percentage: addFormData.fraud_percentage,
      scenario_1: addFormData.scenario_1,
      scenario_2: addFormData.scenario_2,
      scenario_3: addFormData.scenario_3,
      scenario_4: addFormData.scenario_4,
      scenario_5: addFormData.scenario_5,
      scenario_6: addFormData.scenario_6,
    };

    // Sending POST request to API
    fetch(`${config.apiUrl}/simulator`, {
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
            setGenerationMessage("Error generating data");
          });
      })
      .finally(() => {
        setIsGenerating(false);
      });
  };

  const checkActiveTable = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/table`);
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

  //DELETING DATA
  const handleDeleteClick = (dataId) => {
    // Sending DELETE request to API
    fetch(`${config.apiUrl}/simulator/${dataId}`, {
      method: "DELETE",
    })
      .then(() => {
        // Remove the deleted data from the products state
        const updatedProducts = products.filter(
          (data) => data.user_id !== dataId
        );
        setProducts(updatedProducts);
      })
      .catch((error) => console.error("Error deleting data:", error));
  };

  const handleRestoreClick = (dataId) => {
    // Sending POST request to the restore endpoint
    fetch(`${config.apiUrl}/tableName/${dataId}`, {
      method: "POST", // Make sure it's a POST request
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ dataId }),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Table restored successfully.");
          // Reload the page after table update
          window.location.reload();
        } else {
          throw new Error("Table restoration failed.");
        }
      })
      .catch((error) => {
        console.error("Error restoring table:", error);
        // Handle error scenarios here
      });
  };

  //ARCHIVING DATA
  const handleArchiveClick = (dataId) => {
    // Sending DELETE request to API
    fetch(`${config.apiUrl}/archive/${dataId}`, {
      method: "DELETE",
    })
      .then(() => {
        // Remove the deleted data from the products state
        const updatedProducts = products.filter(
          (data) => data.user_id !== dataId
        );
        setProducts(updatedProducts);
      })
      .catch((error) => console.error("Error deleting data:", error));
  };

  const [streamFormData, setStreamFormData] = useState({
    head: "",
    interval: "",
  });

  const handleStreamFormChange = (event) => {
    const fieldName = event.target.name;
    const fieldValue = event.target.value;

    // Validate if fieldValue is a valid number
    if (/^\d+$/.test(fieldValue)) {
      setStreamFormData({
        ...streamFormData,
        [fieldName]: fieldValue,
      });
    }
  };

  const handleStreamFormSubmit = (event) => {
    event.preventDefault();

    const newData = {
      head: streamFormData.head,
      interval: streamFormData.interval,
    };

    setIsStreaming(true); // Set isStreaming to true when streaming begins

    fetch(`${config.apiUrl}/streamTable`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newData),
    })
      .then((response) => response.json())
      .then((responseData) => {
        console.log("Data sent successfully:", responseData);
        window.location.reload();
      })
      .catch((error) => console.error("Error sending data:", error))
      .finally(() => setIsStreaming(false)); // Set isStreaming to false when streaming is complete
  };

  //////////////////////////////////////////////////////////////////////////////////////

  const handleModifyFraudSubmit = async (event) => {
    setIsModifying(true);
    event.preventDefault();

    ModifyFrauds();

    setmodifyMessage("Modifying Frauds, this may take some time...");
  };

  const handleModifyFraudChange = (event) => {
    event.preventDefault();

    const fieldName = event.target.getAttribute("name");
    const fieldValue = event.target.value;

    const newFormData = { ...ModifyFraudData };
    newFormData[fieldName] = fieldValue;

    setModifyFraudData(newFormData);
  };

  const ModifyFrauds = (suffix) => {
    const newData = {
      fraud_percentage: ModifyFraudData.fraud_percentage,
      scenario_1: ModifyFraudData.scenario_1,
      scenario_2: ModifyFraudData.scenario_2,
      scenario_3: ModifyFraudData.scenario_3,
      scenario_4: ModifyFraudData.scenario_4,
      scenario_5: ModifyFraudData.scenario_5,
      scenario_6: ModifyFraudData.scenario_6,
    };

    // Sending POST request to API
    fetch(`${config.apiUrl}/modify_frauds`, {
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
        setmodifyMessage("Data Generated");
      })
      .catch((error) => {
        console.error("Error adding data:", error);
        error
          .json()
          .then((errorMessage) => {
            setmodifyMessage(errorMessage.error);
          })
          .catch(() => {
            setmodifyMessage("Error generating data");
          });
      })
      .finally(() => {
        setIsModifying(false);
      });
  };

  //////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    document.title = "Transaction Data Simulator";
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
          Transaction Data Simulator
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
          <li className="nav-item">Simulator</li>
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
        <h2>Generate Data</h2>
        {/* ADD DATA */}
        <form onSubmit={handleAddFormSubmit}>
          <br />
          <div className="form-row">
            <label htmlFor="n_customers">Customers</label>
            <input
              type="number"
              name="n_customers"
              required="required"
              className="narrow-input"
              onChange={handleAddFormChange}
            />
          </div>
          <div className="form-row">
            <label htmlFor="n_terminals">Terminals</label>
            <input
              type="number"
              name="n_terminals"
              required="required"
              className="narrow-input"
              onChange={handleAddFormChange}
            />
          </div>
          <div className="form-row">
            <label htmlFor="nb_days">Days</label>
            <input
              type="number"
              name="nb_days"
              required="required"
              className="narrow-input"
              onChange={handleAddFormChange}
            />
          </div>
          <div className="form-row">
            <label htmlFor="start_date">Start Date</label>
            <input
              type="text"
              name="start_date"
              required="required"
              placeholder="yyyy-mm-dd"
              className="narrow-input"
              onChange={handleAddFormChange}
            />
          </div>
          <div className="form-row">
            <label htmlFor="radius">Radius</label>
            <input
              type="number"
              name="radius"
              required="required"
              className="narrow-input"
              onChange={handleAddFormChange}
            />
          </div>
          <div className="form-row">
            <label htmlFor="fraud_percentage">Fraud %</label>
            <input
              type="text"
              name="fraud_percentage"
              placeholder=" 1"
              //required="required"
              className="narrow-input"
              onChange={handleAddFormChange}
              pattern="\d+(\.\d{1,2})?"
            />
          </div>
          <div className="form-row">
            <label htmlFor="scenario_1">Scenario 1</label>
            <input
              type="text" // Change input type to text
              name="scenario_1"
              className="narrow-input"
              placeholder=" 16.67"
              onChange={handleAddFormChange}
              pattern="\d+(\.\d{1,2})?"
              title="Scenario 1: This scenario simulates a case where the
physical card has been stolen and a fraudster
impersonates the customer purchasing goods or service
with the stolen card."
            />
          </div>
          <div className="form-row">
            <label htmlFor="scenario_2">Scenario 2</label>
            <input
              type="text" // Change input type to text
              name="scenario_2"
              className="narrow-input"
              placeholder=" 16.67"
              onChange={handleAddFormChange}
              pattern="\d+(\.\d{1,2})?"
              title="Scenario 2: Similar to the first case but here a card-not-
present fraud takes place where the credentials of a
customer have been leaked through phishing or a large
data leak but the physical has not been stolen."
            />
          </div>
          <div className="form-row">
            <label htmlFor="scenario_3">Scenario 3</label>
            <input
              type="text" // Change input type to text
              name="scenario_3"
              className="narrow-input"
              placeholder=" 16.67"
              onChange={handleAddFormChange}
              pattern="\d+(\.\d{1,2})?"
              title="Scenario 3: This scenario simulates cloned
Card/skimming scenario it includes cases where the
fraudster creates a clone of the card, letting the user keep
the original card but without knowledge of the loss of
security."
            />
          </div>
          <div className="form-row">
            <label htmlFor="scenario_4">Scenario 4</label>
            <input
              type="text" // Change input type to text
              name="scenario_4"
              className="narrow-input"
              placeholder=" 16.67"
              onChange={handleAddFormChange}
              pattern="\d+(\.\d{1,2})?"
              title="Scenario 4:  This scenario simulates a criminal use of the terminal. 
A part of the transactions from the selected terminal will be marked as fraudulant."
            />
          </div>
          <div className="form-row">
            <label htmlFor="scenario_5">Scenario 5</label>
            <input
              type="text" // Change input type to text
              name="scenario_5"
              className="narrow-input"
              placeholder=" 16.67"
              onChange={handleAddFormChange}
              pattern="\d+(\.\d{1,5})?"
              title="Scenario 5: This scenario includes cases where the
fraudster uses a method called Carding to purchase 
cheaper immaterial goods on the Internet to verify the
validity of the card."
            />
          </div>
          <div className="form-row">
            <label htmlFor="scenario_">Scenario 6</label>
            <input
              type="text" // Change input type to text
              name="scenario_6"
              className="narrow-input"
              placeholder=" 16.67"
              onChange={handleAddFormChange}
              pattern="\d+(\.\d{1,2})?"
              title="Scenario 6: Threshold based scenario where all amounts Greater than 220 are marked fraudulent"
            />
          </div>
          <button
            type="submit"
            className="stream-button"
            disabled={isGenerating}
          >
            Generate
          </button>
          {isGenerating && <p>Generating Data, this may take some time...</p>}
          {generationMessage && !isGenerating && <p>{generationMessage}</p>}
        </form>
      </div>

      <div className="form-container">
        <h2>Modify Frauds</h2>
        {/* ADD DATA */}
        <form onSubmit={handleModifyFraudSubmit}>
          <br />
          <div className="form-row">
            <label htmlFor="fraud_percentage">Fraud %</label>
            <input
              type="text"
              name="fraud_percentage"
              placeholder=" 1"
              //required="required"
              className="narrow-input"
              onChange={handleModifyFraudChange}
              pattern="\d+(\.\d{1,2})?"
            />
          </div>
          <div className="form-row">
            <label htmlFor="scenario_1">Scenario 1</label>
            <input
              type="text" // Change input type to text
              name="scenario_1"
              className="narrow-input"
              placeholder=" 16.67"
              onChange={handleModifyFraudChange}
              pattern="\d+(\.\d{1,2})?"
              title="Scenario 1: This scenario simulates a case where the
physical card has been stolen and a fraudster
impersonates the customer purchasing goods or service
with the stolen card."
            />
          </div>
          <div className="form-row">
            <label htmlFor="scenario_2">Scenario 2</label>
            <input
              type="text" // Change input type to text
              name="scenario_2"
              className="narrow-input"
              placeholder=" 16.67"
              onChange={handleModifyFraudChange}
              pattern="\d+(\.\d{1,2})?"
              title="Scenario 2: Similar to the first case but here a card-not-
present fraud takes place where the credentials of a
customer have been leaked through phishing or a large
data leak but the physical has not been stolen."
            />
          </div>
          <div className="form-row">
            <label htmlFor="scenario_3">Scenario 3</label>
            <input
              type="text" // Change input type to text
              name="scenario_3"
              className="narrow-input"
              placeholder=" 16.67"
              onChange={handleModifyFraudChange}
              pattern="\d+(\.\d{1,2})?"
              title="Scenario 3: This scenario simulates cloned
Card/skimming scenario it includes cases where the
fraudster creates a clone of the card, letting the user keep
the original card but without knowledge of the loss of
security."
            />
          </div>
          <div className="form-row">
            <label htmlFor="scenario_4">Scenario 4</label>
            <input
              type="text" // Change input type to text
              name="scenario_4"
              className="narrow-input"
              placeholder=" 16.67"
              onChange={handleModifyFraudChange}
              pattern="\d+(\.\d{1,2})?"
              title="Scenario 4:  This scenario simulates a criminal use of the terminal. 
A part of the transactions from the selected terminal will be marked as fraudulant."
            />
          </div>
          <div className="form-row">
            <label htmlFor="scenario_5">Scenario 5</label>
            <input
              type="text" // Change input type to text
              name="scenario_5"
              className="narrow-input"
              placeholder=" 16.67"
              onChange={handleModifyFraudChange}
              pattern="\d+(\.\d{1,5})?"
              title="Scenario 5: This scenario includes cases where the
fraudster uses a method called Carding to purchase 
cheaper immaterial goods on the Internet to verify the
validity of the card."
            />
          </div>
          <div className="form-row">
            <label htmlFor="scenario_">Scenario 6</label>
            <input
              type="text" // Change input type to text
              name="scenario_6"
              className="narrow-input"
              placeholder=" 16.67"
              onChange={handleModifyFraudChange}
              pattern="\d+(\.\d{1,2})?"
              title="Scenario 6: Threshold based scenario where all amounts Greater than 220 are marked fraudulent"
            />
          </div>
          <button
            type="submit"
            className="stream-button"
            disabled={isModifying}
          >
            Modify
          </button>
          {isModifying && (
            <p>Modifying Fraud amount, this may take some time...</p>
          )}
          {modifyMessage && !isModifying && <p>{modifyMessage}</p>}
        </form>
      </div>

      <div className="form-container">
        <h2>Stream Data</h2>
        <form onSubmit={handleStreamFormSubmit}>
          <div className="form-row-stream-table">
            <label htmlFor="head">Number of Rows</label>
            <input
              type="number"
              name="head"
              required
              className="narrow-input"
              onChange={handleStreamFormChange}
              value={streamFormData.num_rows}
            />
          </div>
          <div className="form-row-stream-table">
            <label htmlFor="interval">Delay Interval</label>
            <input
              type="number"
              name="interval"
              required
              className="narrow-input"
              placeholder="milliseconds"
              onChange={handleStreamFormChange}
              value={streamFormData.interval}
            />
          </div>
          <button
            type="submit"
            className="stream-button"
            disabled={isStreaming}
          >
            Stream
          </button>
          {isStreaming && <p>Streaming Active Table...</p>}
        </form>
      </div>

      <hr />

      <form onSubmit={handleEditFormSubmit}>
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
              <th
                title="Scenario 1: This scenario simulates a case where the
physical card has been stolen and a fraudster
impersonates the customer purchasing goods or service
with the stolen card."
              >
                Scenario 1
              </th>
              <th
                title="Scenario 2: Similar to the first case but here a card-not-
present fraud takes place where the credentials of a
customer have been leaked through phishing or a large
data leak but the physical has not been stolen."
              >
                Scenario 2
              </th>
              <th
                title="Scenario 3: This scenario simulates cloned
Card/skimming scenario it includes cases where the
fraudster creates a clone of the card, letting the user keep
the original card but without knowledge of the loss of
security."
              >
                Scenario 3
              </th>
              <th
                title="Scenario 4:  This scenario simulates a criminal use of the terminal. 
A part of the transactions from the selected terminal will be marked as fraudulant."
              >
                Scenario 4
              </th>
              <th
                title="Scenario 5: This scenario includes cases where the
fraudster uses a method called Carding to purchase 
cheaper immaterial goods on the Internet to verify the
validity of the card."
              >
                Scenario 5
              </th>
              <th title="Scenario 6: Threshold based scenario where all amounts Greater than 220 are marked fraudulent">
                Scenario 6
              </th>
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
                    handleArchiveClick={handleArchiveClick}
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

export default App;
