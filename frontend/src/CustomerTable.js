import React, { useState, useEffect } from "react";
import "./TransformedTable.css";
import { useNavigate } from "react-router-dom";
import CustomerModal from "./CustomerModal";
import logo from "./zt.png";
import config from "./config";

const CustomerTable = () => {
  const [data, setData] = useState([]);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [CustomerData, setCustomerData] = useState();
  const navigate = useNavigate();
  const [isRegen, setIsRegen] = useState(false);

  const columns = [
    "CUSTOMER_ID",
    "mean_amount",
    "std_amount",
    "mean_nb_tx_per_day",
  ];

  const limit = 10;
  const table = 3;

  const fetchData = async (limit, page) => {
    const res = await fetch(
      `${config.apiUrl}/customer_table/limit/${limit}/page/${page}`
    );
    const json = await res.json();
    setData(JSON.parse(json));
    setRows(JSON.parse(json));
  };

  const handleNext = async () => {
    const nextPage = page + 1;
    const res = await fetch(
      `${config.apiUrl}/customer_table/limit/${limit}/page/${nextPage}`
    );
    const json = await res.json();
    setRows(JSON.parse(json));
    setPage(nextPage);
  };

  const handlePrevious = async () => {
    const previousPage = page - 1;
    if (previousPage > 0) {
      const res = await fetch(
        `${config.apiUrl}/customer_table/limit/${limit}/page/${previousPage}`
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
      `${config.apiUrl}/customer_table/limit/${limit}/page/1`
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
      `${config.apiUrl}/customer_table/limit/${limit}/page/${lastPage}`
    );
    const jsonData = await resData.json();

    setRows(JSON.parse(jsonData));
    setPage(lastPage);
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

  //////////////////////////////////////////////////////////////////////////////////////

  const [tableEntries, setTableEntries] = useState({
    count_customer_profile: 0,
  });

  const [regenFormData, setRegenFormData] = useState({
    customers: "",
  });

  const handleRegenFormChange = (event) => {
    const fieldName = event.target.name;
    const fieldValue = event.target.value;

    // Validate if fieldValue is a valid number
    if (/^\d+$/.test(fieldValue)) {
      setRegenFormData({
        ...regenFormData,
        [fieldName]: fieldValue,
      });
    }
  };

  const handleRegenFormSubmit = (event) => {
    event.preventDefault();

    const newData = {
      customers: regenFormData.customers,
    };

    setIsRegen(true);

    fetch(`${config.apiUrl}/regen_customer_table`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newData),
    }).then(() => window.location.reload());
  };

  ////////////////////////////////////////////////////////////////////////////////////

  const fetchTableEntries = () => {
    fetch(`${config.apiUrl}/table_entries`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setTableEntries({
          count_customer_profile: data.count_customer_profile,
        });
      })
      .catch((error) => console.error("Error fetching table entries:", error));
  };

  useEffect(() => {
    fetchTableEntries();
  }, []);

  //////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    document.title = "Customer Profiles";
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
          Customer Profiles
        </h1>
      </div>
      <nav className="navbar">
        <ul className="nav-list">
          <li className="nav-item">Customer Profiles</li>
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

      <div className="form-container">
        <h2>Regenerate Customer profiles</h2>
        <form onSubmit={handleRegenFormSubmit}>
          <div className="form-row-stream-table">
            <label htmlFor="head">Number of Customers</label>
            <input
              type="number"
              name="customers"
              required
              className="narrow-input"
              onChange={handleRegenFormChange}
              value={regenFormData.customers}
              placeholder={`current count: ${tableEntries.count_customer_profile}`}
            />
          </div>
          <button type="submit" className="stream-button" disabled={isRegen}>
            Regenerate
          </button>
          {isRegen && <p>Regeneratig Tables...</p>}
        </form>
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
              <th>Customer ID</th>
              <th>Mean Spending</th>
              <th>Standard Deviation Spending</th>
              <th>Mean TX Per Day</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr>
                <td
                  className="link"
                  onClick={() => handleOpenModal(d[columns[0]], 2)}
                >
                  {d[columns[0]]}
                </td>
                <td>{d[columns[1]]}</td>
                <td>{d[columns[2]]}</td>
                <td>{d[columns[3]]}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
export default CustomerTable;
