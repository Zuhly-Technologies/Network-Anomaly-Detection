import React, { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function AlertDialog({
  open,
  setOpen,
  handleBackupInputChange,
  handleOverride,
  backupTableNames,
  onGenerateButtonClick,
}) {
  const [value, setValue] = useState("");

  const handleClose = () => {
    setOpen(false);
    onGenerateButtonClick();
  };

  const Close = () => {
    setOpen(false);
    onGenerateButtonClick();
    window.location.reload();
  };

  const handleBackup = () => {
    handleBackupInputChange({ target: { value } });
    handleClose();
  };

  const handleOverrideClick = () => {
    handleOverride();
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title"></DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          An active table already exists, input a backup name to create a
          backup, leaving it empty will override the old table.
        </DialogContentText>
        <br />
        <TextField
          value={value}
          onChange={(e) => setValue(e.target.value)}
          label="Backup Suffix"
          variant="outlined"
        />
        <br />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleBackup} disabled={!value.trim()} autoFocus>
          Backup
        </Button>
        <Button onClick={handleOverrideClick} autoFocus>
          Override
        </Button>
        <Button onClick={Close} autoFocus>
          Cancel
        </Button>
      </DialogActions>
      <DialogContentText id="backup-table-names">
        <strong style={{ paddingLeft: "25px" }}>Current Backups:</strong>
        <ul
          style={{
            marginTop: "10px",
            marginBottom: "20px",
            paddingLeft: "65px",
          }}
        >
          {backupTableNames.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </DialogContentText>
    </Dialog>
  );
}
