import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import Modal from "@mui/material/Modal";

const Countdown = ({ setOpen, open, firstTurn }) => {
  const [counter, setCounter] = useState(3);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    if (counter < 0) {
      setOpen(false);
      return;
    }
    const timer = setTimeout(() => {
      setFade(true);
      setTimeout(() => {
        setCounter((prevCounter) => prevCounter - 1);
        setFade(false);
      }, 400);
    }, 600);
    return () => clearTimeout(timer);
  }, [counter, open]);

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      sx={{
        position: "absolute",
        top: "30%",
        left: "52.5%",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "200px",
          height: "200px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: "10rem",
            opacity: fade ? 0 : 1,
            transition: "font-size 1s, opacity 1s",
            color: "white",
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {counter === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <p>START!</p>
              {firstTurn === 2 ? (
                <p style={{ fontSize: "5rem", color: "#d0ecfd" }}>Your move</p>
              ) : (
                <p style={{ fontSize: "5rem", color: "#fbcfcf" }}>
                  Enemy's move
                </p>
              )}
            </div>
          ) : (
            counter
          )}
        </Typography>
      </div>
    </Modal>
  );
};

export default Countdown;
