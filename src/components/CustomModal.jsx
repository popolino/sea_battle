import React from "react";
import Modal from "@mui/material/Modal";

const CustomModal = ({ children, open, onClose }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        position: "absolute",
        top: "40%",
        left: "51%",
      }}
    >
      {children}
    </Modal>
  );
};

export default CustomModal;
