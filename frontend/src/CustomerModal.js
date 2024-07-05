import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function CustomerModal({ open, setOpen, rows, setRows }) {
  const [page, setPage] = useState(1);
  const [slicedRows, setSlicedRows] = useState([]);

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
  ];

  const handleClose = () => {
    setOpen(false);
    setPage(1);
  };

  useEffect(() => {
    setSlicedRows(rows?.slice(0, 10));
  }, [rows]);

  const pageSize = 10;

  const handleNext = () => {
    const nextPage = page + 1;
    if (nextPage * pageSize <= rows.length) {
      setSlicedRows(
        rows.slice(nextPage * pageSize - pageSize, nextPage * pageSize)
      );
      setPage(nextPage);
    }
  };

  const handlePrevious = () => {
    const previousPage = page - 1;
    if (previousPage > 0) {
      setSlicedRows(
        rows.slice(previousPage * pageSize - pageSize, previousPage * pageSize)
      );
      setPage(previousPage);
    }
  };

  const color = (fraud) => (fraud === 1 ? "red" : "");

  return (
    <Dialog open={open} maxWidth="xl" onClose={handleClose}>
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
          </tr>
        </thead>
        <tbody>
          {slicedRows?.map((d) => (
            <tr
              style={{
                color: color(d[columns[8]]),
              }}
            >
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
            </tr>
          ))}
        </tbody>
      </table>
      <DialogActions>
        page:{page}
        <Button onClick={handlePrevious} autoFocus>
          Previous
        </Button>
        <Button onClick={handleNext} autoFocus>
          Next
        </Button>
        <Button onClick={handleClose} autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
