import React, { createContext, useState, useContext, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { getUserByLogin } from "../api/api";

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const authUser = JSON.parse(localStorage.getItem("user"));

  const [placedShips, setPlacedShips] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [socket, setSocket] = useState(null);
  const [enemy, setEnemy] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const [startAnimation, setStartAnimation] = useState(false);
  const [enemyShots, setEnemyShots] = useState([]);
  const [gameFinished, setGameFinished] = useState(false);
  const [winner, setWinner] = useState(null);

  const [destroyedShips, setDestroyedShips] = useState([]);
  const [ships, setShips] = useState([
    { id: "ship4", size: 4, count: 1 },
    { id: "ship3", size: 3, count: 2 },
    { id: "ship2", size: 2, count: 3 },
    { id: "ship1", size: 1, count: 4 },
  ]);
  const [shipsOfEnemy, setShipsOfEnemy] = useState([
    { id: "ship4", size: 1, destroyed: 0 },
    { id: "ship3", size: 2, destroyed: 0 },
    { id: "ship2", size: 3, destroyed: 0 },
    { id: "ship1", size: 4, destroyed: 0 },
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    const ws = new WebSocket("ws:/45.135.233.235:3001");
    ws.onopen = () => {
      console.log("WebSocket connection established");
      ws.send(JSON.stringify({ type: "get_rooms" }));
      const gameId = localStorage.getItem("currentGameId");
      const savedEnemyShots = localStorage.getItem("enemyShots");
      savedEnemyShots && setEnemyShots(JSON.parse(savedEnemyShots));
      const savedDestroyedShips = localStorage.getItem("destroyedShips");
      if (savedDestroyedShips) {
        const destroyedShipsArray = JSON.parse(savedDestroyedShips);
        setDestroyedShips(destroyedShipsArray);
        destroyedShipsArray.forEach((destroyedShip) => {
          updateDestroyedShipsStats(destroyedShip.shipId);
        });
      }
      const currentEnemy = JSON.parse(localStorage.getItem("enemy"));
      currentEnemy && setEnemy(currentEnemy);
      gameId && getGameViaWebSocket(gameId, ws, setCurrentGame);
      const storedShips = localStorage.getItem("shipsCount");
      if (storedShips) {
        setShips(JSON.parse(storedShips));
      }
      const storedShipsOfEnemy = localStorage.getItem("shipsEnemyCount");
      if (storedShipsOfEnemy) {
        setShipsOfEnemy(JSON.parse(storedShipsOfEnemy));
      }
      const storedWinner = localStorage.getItem("winner");
      setWinner(storedWinner);
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "all_rooms") {
        setRooms(data.rooms);
      } else if (data.type === "room_created") {
        setRooms((prevRooms) => [...prevRooms, data.room]);
      } else if (data.type === "room_ready") {
        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.room_id === data.room.room_id ? data.room : room
          )
        );
      } else if (data.type === "room_deleted") {
        setRooms((prevRooms) =>
          prevRooms.filter((room) => room.room_id !== data.room_id)
        );
        localStorage.removeItem("roomId");
      } else if (data.type === "game_created") {
        console.log("Game created:", data.game);
        setCurrentGame(data.game);
        localStorage.setItem("currentGameId", data.game.id);
        const enemy =
          data.game.player1_login === authUser.login
            ? data.game.player2_login
            : data.game.player1_login;
        fetchUser(enemy).then(() => {});
        localStorage.setItem("shipsEnemyCount", JSON.stringify(shipsOfEnemy));
      } else if (data.type === "game_deleted") {
        console.log("Game deleted");
        const currentId = localStorage.getItem("currentGameId");
        if (currentId === data.game_id) {
          setOpponentLeft(true);
        }
        localStorage.removeItem("currentGameId");
        localStorage.removeItem("placedShips");
        localStorage.removeItem("enemy");
        localStorage.removeItem("enemyShots");
        localStorage.removeItem("myShots");
        localStorage.removeItem("destroyedShips");
        localStorage.removeItem("shipsEnemyCount");
        localStorage.removeItem("winner");
        setPlacedShips([]);
        setEnemy(null);
        setCurrentGame(null);
        setEnemyShots([]);
        setShipsOfEnemy([]);
        setDestroyedShips([]);
        setWinner(null);
        setShips([
          { id: "ship4", size: 4, count: 1 },
          { id: "ship3", size: 3, count: 2 },
          { id: "ship2", size: 2, count: 3 },
          { id: "ship1", size: 1, count: 4 },
        ]);
        localStorage.removeItem("shipsCount");
      } else if (data.type === "game_data") {
        localStorage.setItem("shipsEnemyCount", JSON.stringify(shipsOfEnemy));
        console.log("Game restored:", data.game);
        setCurrentGame(data.game);
        data.game.status === "finished" && setGameFinished(true);
      } else if (data.type === "game_updated") {
        console.log("Game updated:", data.game);
        if (
          data.game.status === "in_progress" &&
          data.game.moves_history.length === 0
        )
          setStartAnimation(true);
        setCurrentGame(data.game);
      } else if (data.type === "check_hit") {
        console.log("Shot received:", data.shot);
        if (data.shot.player_login !== authUser.login) {
          setEnemyShots((prevShots) => {
            const validPrevShots = Array.isArray(prevShots) ? prevShots : [];
            const updatedShots = [...validPrevShots, data.shot];
            localStorage.setItem("enemyShots", JSON.stringify(updatedShots));
            return updatedShots;
          });
        }
      } else if (data.type === "game_finished") {
        console.log("Game finished, winner is:", data.winner);
        setGameFinished(true);
        setWinner(data.winner);
        localStorage.setItem("winner", data.winner);
      }
    };
    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    setSocket(ws);
    return () => {
      ws.close();
    };
  }, []);

  const handleCreateRoom = () => {
    const roomId = uuidv4();
    const newRoom = {
      room_id: roomId,
      name: name,
      creator: authUser.login,
      status: "waiting",
    };
    const createRoomMessage = JSON.stringify({
      type: "create_room",
      ...newRoom,
    });
    socket.send(createRoomMessage);
    setOpen(false);
    setName("");
    localStorage.setItem("roomId", roomId);
    navigate(`/rooms/${roomId}`);
  };
  const handleConnectToRoom = (roomId) => {
    const joinRoomMessage = JSON.stringify({
      type: "join_room",
      room_id: roomId,
      player2: authUser.login,
    });
    socket.send(joinRoomMessage);
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.room_id === roomId
          ? { ...room, status: "playing", player2: authUser.login }
          : room
      )
    );
    navigate(`/rooms/${roomId}`);
    localStorage.setItem("roomId", roomId);
  };
  const handleDeleteRoom = (roomId) => {
    const joinRoomMessage = JSON.stringify({
      type: "delete_room",
      room_id: roomId,
    });
    socket.send(joinRoomMessage);
  };
  const handleCreateGame = (player1, player2) => {
    const createGameMessage = JSON.stringify({
      type: "create_game",
      player1_login: player1,
      player2_login: player2,
      player1_ships: placedShips,
      player2_ships: {},
    });
    socket.send(createGameMessage);
  };
  const handleDeleteGame = (gameId) => {
    const deleteGameMessage = JSON.stringify({
      type: "delete_game",
      game_id: gameId,
    });
    socket.send(deleteGameMessage);
  };
  const getGameViaWebSocket = (gameId, socket) => {
    if (!gameId) {
      throw new Error("Game ID not found");
    }
    if (!socket) {
      throw new Error("WebSocket connection is not established");
    }
    const request = {
      type: "get_game",
      game_id: gameId,
    };
    socket.send(JSON.stringify(request));
  };
  const fetchUser = async (login) => {
    try {
      const data = await getUserByLogin(login);
      localStorage.setItem("enemy", JSON.stringify(data));
      setEnemy(data);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };
  const updateGameViaWebSocket = (gameId, updateFields) => {
    if (!gameId) {
      throw new Error("Game ID not found");
    }
    if (!socket) {
      throw new Error("WebSocket connection is not established");
    }
    const request = {
      type: "update_game",
      game_id: gameId,
      updateFields,
    };
    socket.send(JSON.stringify(request));
  };
  const checkHitViaWebSocket = (gameId, playerLogin, cell) => {
    if (!socket) {
      throw new Error("WebSocket connection is not established");
    }
    const request = {
      type: "check_hit",
      game_id: gameId,
      player_login: playerLogin,
      cell,
    };
    socket.send(JSON.stringify(request));
  };

  const updateDestroyedShipsStats = (shipId) => {
    setShipsOfEnemy((prevStats) => {
      return prevStats.map((ship) =>
        ship.id === shipId ? { ...ship, destroyed: ship.destroyed + 1 } : ship
      );
    });
  };
  const saveGameToLocalStorage = () => {
    localStorage.setItem("placedShips", JSON.stringify(placedShips));
    localStorage.setItem("myShots", JSON.stringify([]));
    localStorage.setItem("enemyShots", JSON.stringify([]));
    localStorage.setItem("destroyedShips", JSON.stringify([]));
    localStorage.setItem("shipsCount", JSON.stringify(ships));
  };

  return (
    <GameContext.Provider
      value={{
        rooms,
        setRooms,
        open,
        setOpen,
        name,
        setName,
        handleCreateRoom,
        handleConnectToRoom,
        handleDeleteRoom,
        setSocket,
        placedShips,
        setPlacedShips,
        enemy,
        saveGameToLocalStorage,
        handleCreateGame,
        handleDeleteGame,
        currentGame,
        getGameViaWebSocket,
        opponentLeft,
        updateGameViaWebSocket,
        setStartAnimation,
        startAnimation,
        checkHitViaWebSocket,
        enemyShots,
        updateDestroyedShipsStats,
        shipsOfEnemy,
        destroyedShips,
        setDestroyedShips,
        ships,
        setShips,
        setShipsOfEnemy,
        gameFinished,
        winner,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
