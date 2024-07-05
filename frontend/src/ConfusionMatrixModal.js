import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function ConfusionMatrix({ open, setOpen, rows, setRows }) {
  const [slicedRows, setSlicedRows] = useState([]);

  const columns = ["column_1", "column_2"];

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    setSlicedRows(rows?.slice(0, 10));
  }, [rows]);

  return (
    <Dialog open={open} maxWidth="xl" onClose={handleClose}>
      <table>
        <thead>
          <tr>
            <th colSpan={3} style={{ textAlign: "center" }}>
              Expected
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              rowSpan={3}
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                textAlign: "center",
                verticalAlign: "middle",
              }}
            >
              Predicted
            </td>
          </tr>
          {slicedRows?.map((d, index) => (
            <tr key={index}>
              <td style={{ padding: "50px", fontSize: "35px" }}>
                {d[columns[0]]}
              </td>
              <td style={{ padding: "50px", fontSize: "35px" }}>
                {d[columns[1]]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <DialogActions>
        <Button onClick={handleClose} autoFocus>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
