import React from "react";
import {
  Button,
  FormControl,
  FormHelperText,
  InputAdornment,
  OutlinedInput,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOpenIcon from "@mui/icons-material/LockOpen";

const CustomMui = ({
  type,
  text,
  variant,
  value,
  onChange,
  buttonType,
  onClick,
  error,
}) => {
  return (
    <>
      {variant === "input" && (
        <FormControl fullWidth variant="outlined" error={error}>
          <OutlinedInput
            variant="standard"
            placeholder={text}
            type={type}
            fullWidth
            value={value}
            onChange={onChange}
            autoComplete="new-password"
            sx={{
              borderRadius: "50px",
              backgroundColor: "#e9f6ff",
              color: "#263A5C",
              "& .MuiOutlinedInput-input": {
                padding: "10px 10px",
              },
              "& .MuiInputAdornment-root": {
                color: "#263A5C",
              },
            }}
            startAdornment={
              <InputAdornment position="start">
                {(text === "Login" || text === "Name") && <PersonOutlineIcon />}
                {(text === "Password" || text === "Repeat Password") && (
                  <LockOpenIcon />
                )}
              </InputAdornment>
            }
          />
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      )}

      {variant === "button" && (
        <Button
          onClick={onClick}
          variant="contained"
          type={buttonType}
          sx={{
            background: "#487BD9",
            color: "white",
            boxShadow: "none",
            textTransform: "unset",
            borderRadius: "15px",
            fontSize: "12px",
            fontFamily: "Poppins",
            "&:hover": {
              background: "#C0ECFF",
              color: "#487BD9",
              boxShadow: "none",
            },
          }}
        >
          {text}
        </Button>
      )}
    </>
  );
};
export default CustomMui;
