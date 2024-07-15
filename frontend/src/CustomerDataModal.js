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
    attack: false,
    benign: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleClose = () => {
    if (!isSubmitting) {
      setOpen(false);
    }
  };

  useEffect(() => {
    setSlicedRows(rows?.slice(0, 10));
  }, [rows]);

  const handleCheckboxChange = (label) => {
    if (label === "attack") {
      setIsChecked({
        attack: true,
        benign: false,
      });
    } else {
      setIsChecked({
        attack: false,
        benign: true,
      });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const { attack } = isChecked;
    const flag = attack ? "True" : "False";
    console.log(txId);
    console.log(transactionId);
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
              <strong>Id:</strong> {d[columns[0]]}
            </div>
            <div className="list-item-field">
              <strong>Flow Duration:</strong> {d[columns[1]]}
            </div>
            <div className="list-item-field">
              <strong>Total Fwd Packets:</strong> {d[columns[2]]}
            </div>
            <div className="list-item-field">
              <strong>Total Backward Packets:</strong> {d[columns[3]]}
            </div>
            <div className="list-item-field">
              <strong>Total Length of Fwd Packets:</strong> {d[columns[4]]}
            </div>
            <div className="list-item-field">
              <strong>Total Length of Bwd Packets:</strong> {d[columns[5]]}
            </div>
            <div className="list-item-field">
              <strong>Fwd Packet Length Max:</strong> {d[columns[6]]}
            </div>
            <div className="list-item-field">
              <strong>Fwd Packet Length Min:</strong> {d[columns[7]]}
            </div>
            <div className="list-item-field">
              <strong>Fwd Packet Length Mean:</strong> {d[columns[8]]}
            </div>
            <div className="list-item-field">
              <strong>Fwd Packet Length Std:</strong> {d[columns[9]]}
            </div>
            <div className="list-item-field">
              <strong>Bwd Packet Length Max:</strong> {d[columns[10]]}
            </div>
            <div className="list-item-field">
              <strong>Bwd Packet Length Mean:</strong> {d[columns[11]]}
            </div>
            <div className="list-item-field">
              <strong>Bwd Packet Length Std:</strong> {d[columns[12]]}
            </div>
            <div className="list-item-field">
              <strong>Flow Bytes/s:</strong> {d[columns[13]]}
            </div>
            <div className="list-item-field">
              <strong>Flow IAT Mean:</strong> {d[columns[14]]}
            </div>
            <div className="list-item-field">
              <strong>Flow IAT Std:</strong> {d[columns[15]]}
            </div>
            <div className="list-item-field">
              <strong>Flow IAT Max:</strong> {d[columns[16]]}
            </div>
            <div className="list-item-field">
              <strong>Flow IAT Min:</strong> {d[columns[17]]}
            </div>
            <div className="list-item-field">
              <strong>Fwd IAT Total:</strong> {d[columns[18]]}
            </div>
            <div className="list-item-field">
              <strong>Label:</strong> {d[columns[19]]}
            </div>
            {/* <div className="list-item-field">
              <strong>Naive Bayes:</strong> {d[columns[20]]}
            </div>
            <div className="list-item-field">
              <strong>QDA:</strong> {d[columns[21]]}
            </div> */}
            <div className="list-item-field">
              <strong>Attack Probability (Random Forest):</strong>{" "}
              {d[columns[22]]}
            </div>
            <div className="list-item-field">
              <strong>Attack Probability (ID3):</strong> {d[columns[23]]}
            </div>
          </div>
        ))}
      </div>
      <DialogActions>
        <FormControlLabel
          control={
            <Checkbox
              checked={isChecked.attack}
              onChange={() => handleCheckboxChange("attack")}
              color="primary"
            />
          }
          label="Attack"
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
        <Button onClick={handleSubmit} autoFocus disabled={isSubmitting}>
          {isSubmitting ? "Modifying..." : "Submit"}
        </Button>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
