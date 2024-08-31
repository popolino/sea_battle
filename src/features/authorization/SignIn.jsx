import React, { useState } from "react";
import classes from "./auth.module.scss";
import CustomMui from "../../components/CustomMui";
import ship from "../../img/auth-ship.png";
import Bubbles from "./Bubbles";
import { authUser } from "../../api/api";
import { useNavigate } from "react-router-dom";
const SignIn = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const user = await authUser(login, password);
      console.log("User authorized:", user);
      navigate("/");
    } catch (error) {
      console.error("Error authorization user:", error);
      setAuthError("Invalid login or password");
    }
  };
  const handleInputChange = (e, setFieldValue) => {
    setFieldValue(e.target.value);
    if (authError) {
      setAuthError(null);
    }
  };
  return (
    <div className={classes.container}>
      <Bubbles />
      <div className={classes.content}>
        <div className={classes["auth-page"]}>
          <h1>SIGN IN</h1>
          <form onSubmit={handleSubmit} id="formSignIn">
            <CustomMui
              type="text"
              text="Login"
              variant="input"
              value={login}
              onChange={(e) => handleInputChange(e, setLogin)}
              error={authError}
            />
            <CustomMui
              type="password"
              text="Password"
              variant="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={authError}
            />
            <p>
              <span>New to our game?</span>
              <a href="/signup"> Create an account</a>
            </p>
            <CustomMui buttonType="submit" text="Sign In" variant="button" />
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

export default SignIn;
