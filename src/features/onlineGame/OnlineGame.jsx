import React, { useEffect, useState } from "react";
import SvgSelector from "../../components/SvgSelector";
import classes from "./onlineGame.module.scss";
import CustomMui from "../../components/CustomMui";
import { useNavigate, useParams } from "react-router-dom";
import { useGame } from "../../contexts/gameContext";
import Game from "../game/Game";
import CustomModal from "../../components/CustomModal";
const OnlineGame = () => {
  const { handleDeleteRoom, rooms, opponentLeft, currentGame } = useGame();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const currentRoom = rooms.find((room) => room.room_id === roomId);
  const { handleCreateGame } = useGame();
  const authUser = JSON.parse(localStorage.getItem("user"));

  const [gameCreated, setGameCreated] = useState(false);
  const currentGameId = localStorage.getItem("currentGameId");

  const handleCloseModal = () => {
    navigate("/rooms");
    window.location.reload();
  };

  useEffect(() => {
    if (!currentGameId) {
      if (
        currentRoom &&
        currentRoom.status === "playing" &&
        authUser.login === currentRoom.player2 &&
        !gameCreated
      ) {
        handleCreateGame(currentRoom.player1, currentRoom.player2);
        setGameCreated(true);
      }
    }
  }, [currentRoom, handleCreateGame, gameCreated, authUser.login, currentGame]);

  if (!currentRoom && !opponentLeft) {
    return <div>404</div>;
  }
  if (opponentLeft && !currentRoom) {
    return (
      <CustomModal
        open={opponentLeft}
        children={
          <div className={classes["modal-opponent"]}>
            <h3>The enemy left the game</h3>
            <CustomMui
              buttonType="button"
              variant="button"
              onClick={handleCloseModal}
              text="Ok"
            />
          </div>
        }
        onClose={() => {}}
      />
    );
  }
  if (currentRoom.status === "waiting") {
    return (
      <div className={classes.loading}>
        <div>
          <p>Waiting for another player</p>
          <SvgSelector id="loader" />
          <CustomMui
            buttonType="button"
            text="Exit"
            variant="button"
            onClick={() => {
              handleDeleteRoom(currentRoom.room_id);
              navigate("/rooms");
            }}
          />
        </div>
      </div>
    );
  } else if (currentRoom.status === "playing") {
    return <Game roomId={currentRoom.room_id} />;
  }
};

export default OnlineGame;
