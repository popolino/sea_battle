import classes from "./navBar.module.scss";
import SvgSelector from "../../components/SvgSelector";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { logoutUser } from "../../api/api";
import { useGame } from "../../contexts/gameContext";

const NavBar = () => {
  const { handleDeleteGame, handleDeleteRoom } = useGame();
  const currentRoomId = localStorage.getItem("roomId");
  const currentGameId = localStorage.getItem("currentGameId");
  const path = useLocation();

  const navList = [
    {
      title: "Online Game",
      path: "/rooms",
      img: "online",
    },
    { title: "Stats", path: "/stats", img: "stats", func: () => {} },
    {
      title: "Best Players",
      path: "/bestPlayers",
      img: "bestPlayers",
    },
    {
      title: "Logout",
      path: "/",
      img: "logout",
    },
  ];
  const navigate = useNavigate();
  const [active, setActive] = useState("Game");
  const click = (item) => {
    if (item.title === "Online Game" && currentRoomId) {
      navigate(`/rooms/${currentRoomId}`);
      setActive(item.path);
      return;
    }
    navigate(item.path);
    setActive(item.path);

    if (item.title === "Logout") {
      handleDeleteGame(currentGameId);
      handleDeleteRoom(currentRoomId);
      logoutUser();
      navigate("/signin");
    }
  };
  useEffect(() => {
    if (path.pathname.startsWith("/rooms") || path.pathname === "/") {
      setActive("/rooms");
    } else {
      const currentNavItem = navList.find(
        (item) => item.path === path.pathname
      );
      if (currentNavItem) {
        setActive(currentNavItem.path);
      }
    }
  }, [path]);
  return (
    <div className={classes.navbar}>
      <h1>Sea Battle</h1>
      <ul>
        {navList.map((item, i) => (
          <li
            key={i}
            className={clsx(
              classes.list,
              item.path === active && classes.active
            )}
            onClick={() => {
              click(item);
            }}
          >
            <SvgSelector id={item.img} />
            <p>{item.title}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NavBar;
