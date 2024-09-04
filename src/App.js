import "./App.css";
import React from "react";
import {
  BrowserRouter as Router,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import SignIn from "./features/authorization/SignIn";
import SignUp from "./features/authorization/SignUp";
import NavBar from "./features/navBar/NavBar";
import Stats from "./features/stats/Stats";
import BestPlayers from "./features/bestPlayers/BestPlayers";
import ProtectedRoute from "./components/ProtectedRoute";
import Rooms from "./features/onlineGame/Rooms";
import OnlineGame from "./features/onlineGame/OnlineGame";
import { GameProvider } from "./contexts/gameContext";

const App = () => {
  return (
    <Router>
      <div className="App">
        <GameProvider>
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route element={<WithNavBar />}>
              <Route path="/" element={<ProtectedRoute element={Rooms} />} />
              <Route
                path="/stats"
                element={<ProtectedRoute element={Stats} />}
              />
              <Route
                path="/bestPlayers"
                element={<ProtectedRoute element={BestPlayers} />}
              />
              <Route
                path="/rooms"
                element={<ProtectedRoute element={Rooms} />}
              />
              <Route
                path="/rooms/:roomId"
                element={<ProtectedRoute element={OnlineGame} />}
              />
              <Route path="*" element={<div className="not-found">404</div>} />
              />
            </Route>
          </Routes>
        </GameProvider>
      </div>
    </Router>
  );
};

const WithNavBar = () => {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
};

export default App;
