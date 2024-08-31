import React, { useState } from "react";
import CustomMui from "../../components/CustomMui";
import classes from "./auth.module.scss";
import Bubbles from "./Bubbles";
import ship from "../../img/auth-ship.png";
import { registerUser } from "../../api/api";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [login, setLogin] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [nameError, setNameError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const navigate = useNavigate();
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password !== repeatPassword) {
      alert("Passwords do not match");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(login)) {
      setLoginError("Invalid email format");
      return;
    }
    if (login.length > 20 || login.length < 6) {
      setLoginError("Email must be 20 symbols, not less than 6");
      return;
    }
    if (name.length > 16 || name.length < 3) {
      setNameError("Name must be 16 symbols, not less than 3");
      return;
    }
    if (password.length < 4) {
      setPasswordError("Password must be minimum 4 symbols");
      return;
    }
    try {
      const user = await registerUser(login, name, password);
      console.log("User registered:", user);
      navigate("/");
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };
  const handleInputChange = (e, setFieldValue, error, setError) => {
    setFieldValue(e.target.value);
    if (error) {
      setError(null);
    }
  };

  return (
    <div className={classes.container}>
      <Bubbles />
      <div className={classes.content}>
        <div className={classes["auth-page"]}>
          <h1>SIGN UP</h1>
          <form onSubmit={handleSubmit} id="formSignUp">
            <CustomMui
              type="text"
              text="Login"
              variant="input"
              value={login}
              onChange={(e) =>
                handleInputChange(e, setLogin, loginError, setLoginError)
              }
              error={loginError}
            />
            <CustomMui
              type="text"
              text="Name"
              variant="input"
              value={name}
              onChange={(e) =>
                handleInputChange(e, setName, nameError, setNameError)
              }
              error={nameError}
            />
            <CustomMui
              type="password"
              text="Password"
              variant="input"
              value={password}
              onChange={(e) =>
                handleInputChange(
                  e,
                  setPassword,
                  passwordError,
                  setPasswordError
                )
              }
              error={passwordError}
            />
            <CustomMui
              type="password"
              text="Repeat Password"
              variant="input"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
            />
            <p>
              <span>Already have an account?</span>
              <a href="/signin"> Sign in</a>
            </p>
            <CustomMui buttonType="submit" text="Sign Up" variant="button" />
          </form>
        </div>
        <div className={classes["title-page"]}>
          <h1>Sea Battle</h1>
          <img src={ship} alt="Ship" />
        </div>
      </div>
    </div>
  );
};

export default SignUp;
