import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import "./CustomerDataModal.css"; // Add CSS for styling

export default function CustomerDataModal({
  open,
  setOpen,
  rows,
  setRows,
  txId,
  transactionId,
  TerminalId,
  terminalId,
  amount,
  Amount,
  fraud,
  Fraud,
}) {
  const [slicedRows, setSlicedRows] = useState([]);
  const [isChecked, setIsChecked] = useState({
    fraudulent: false,
    benign: false,
  });

  const columns = [
    "CUSTOMER_ID",
    "Name",
    "Email",
    "x_customer_id",
    "y_customer_id",
    "mean_amount",
    "std_amount",
    "mean_nb_tx_per_day",
  ];

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    setSlicedRows(rows?.slice(0, 10));
  }, [rows]);

  const handleCheckboxChange = (label) => {
    if (label === "fraudulent") {
      setIsChecked({
        fraudulent: true,
        benign: false,
      });
    } else {
      setIsChecked({
        fraudulent: false,
        benign: true,
      });
    }
  };

  const handleSubmit = async () => {
    const { fraudulent } = isChecked;
    const flag = fraudulent ? "True" : "False";
    const response = await fetch(
      `http://127.0.0.1:5000/modify_label/${txId}/${flag}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      console.error(`Failed to update transaction ${txId}`);
    }
    window.location.reload();
    handleClose();
  };

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      onClose={handleClose}
      PaperProps={{
        style: {
          width: "600px",
          padding: "20px",
        },
      }}
    >
      <div className="list-container">
        {slicedRows?.map((d, index) => (
          <div className="list-item" key={index}>
            <div className="list-item-field">
              <strong>Customer Id:</strong> {d[columns[0]]}
            </div>
            <div className="list-item-field">
              <strong>Name:</strong> {d[columns[1]]}
            </div>
            <div className="list-item-field">
              <strong>Email:</strong> {d[columns[2]]}
            </div>
            <div className="list-item-field">
              <strong>Customer x-cor:</strong> {d[columns[3]]}
            </div>
            <div className="list-item-field">
              <strong>Customer y-cor:</strong> {d[columns[4]]}
            </div>
            <div className="list-item-field">
              <strong>Mean Amount:</strong> {d[columns[5]]}
            </div>
            <div className="list-item-field">
              <strong>STD Amount:</strong> {d[columns[6]]}
            </div>
            <div className="list-item-field">
              <strong>Mean TX/Day:</strong> {d[columns[7]]}
            </div>
            <div className="list-item-field">
              <strong>Terminal Id:</strong> {TerminalId}
            </div>
            <div className="list-item-field">
              <strong>Amount:</strong> {amount}
            </div>
            <div className="list-item-field">
              <strong>Fraud:</strong> {fraud}
            </div>
          </div>
        ))}
      </div>
      <DialogActions>
        <FormControlLabel
          control={
            <Checkbox
              checked={isChecked.fraudulent}
              onChange={() => handleCheckboxChange("fraudulent")}
              color="primary"
            />
          }
          label="Fraudulent"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={isChecked.benign}
              onChange={() => handleCheckboxChange("benign")}
              color="secondary"
            />
          }
          label="Benign"
        />
        <Button onClick={handleSubmit} autoFocus>
          Submit
        </Button>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
