const express = require("express");
const {
  signUp,
  signIn,
  logout,
  getAllUsers,
  getUserByLogin,
} = require("./controllers/auth");
const {
  addUserToRoom,
  createRoom,
  getRooms,
  deleteRoom,
} = require("./controllers/room");
const {
  createGame,
  deleteGame,
  getGame,
  updateGame,
  checkHit,
} = require("./controllers/game");
const {
  getStatistic,
  updateStatistic,
  getPlayersRating,
} = require("./controllers/statistics");

const { sequelize } = require("./models");
const { Room, Game } = require("./models");
const ws = require("ws");
const cors = require("cors");
const http = require("http");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: "http://45.135.233.235:3000",
    credentials: true,
  }),
);
app.use(express.json());

app.post("/api/signup", signUp);
app.post("/api/signin", signIn);
app.post("/api/logout", logout);
app.get("/api/users", getAllUsers);
app.get("/api/users/login/:login", getUserByLogin);
app.put("/api/addUserToRoom", addUserToRoom);
app.post("/api/createRoom", createRoom);
app.get("/api/rooms", getRooms);
app.delete("/api/rooms", deleteRoom);
app.post("/api/game", createGame);
app.delete("/api/game", deleteGame);
app.post("/api/game/id", getGame);
app.put("/api/game", updateGame);
app.post("/api/game/check-hit", checkHit);
app.get("/api/users/:id/statistics", getStatistic);
app.put("/api/users/:id/statistics", updateStatistic);
app.get("/api/players-rating", getPlayersRating);

const server = http.createServer(app);

const webSocketServer = new ws.Server({ server });
webSocketServer.on("connection", (ws) => {
  console.log(
    `New client connected. Total clients: ${webSocketServer.clients.size}`,
  );

  ws.on("message", async (message) => {
    const data = JSON.parse(message);
    console.log("Received message:", data);
    switch (data.type) {
      case "create_room":
        try {
          const room = await Room.create({
            room_id: data.room_id,
            name: data.name,
            player1: data.creator,
            status: "waiting",
          });
          console.log("Room created:", room);
          broadcast({
            type: "room_created",
            room,
          });
        } catch (error) {
          console.error("Error creating room:", error);
          ws.send(
            JSON.stringify({ type: "error", message: "Error creating room" }),
          );
        }
        break;

      case "join_room":
        try {
          const room = await Room.findOne({ where: { room_id: data.room_id } });
          if (!room) {
            return ws.send(
              JSON.stringify({ type: "error", message: "Room not found" }),
            );
          }
          room.player2 = data.player2;
          room.status = "playing";
          await room.save();
          console.log("Player joined room:", room);

          broadcast({
            type: "room_ready",
            room,
          });
        } catch (error) {
          console.error("Error joining room:", error);
          ws.send(
            JSON.stringify({ type: "error", message: "Error joining room" }),
          );
        }
        break;

      case "get_rooms":
        try {
          const rooms = await Room.findAll();
          ws.send(
            JSON.stringify({
              type: "all_rooms",
              rooms,
            }),
          );
        } catch (error) {
          console.error("Error fetching rooms:", error);
          ws.send(
            JSON.stringify({ type: "error", message: "Error fetching rooms" }),
          );
        }
        break;

      case "delete_room":
        try {
          const room = await Room.findOne({ where: { room_id: data.room_id } });
          if (!room) {
            return ws.send(
              JSON.stringify({ type: "error", message: "Room not found" }),
            );
          }
          await room.destroy();

          broadcast({
            type: "room_deleted",
            room_id: data.room_id,
          });
        } catch (error) {
          console.error("Error deleting room:", error);
          ws.send(
            JSON.stringify({ type: "error", message: "Error deleting room" }),
          );
        }
        break;
      case "create_game":
        try {
          const existingGame = await Game.findOne({
            where: {
              player1_login: data.player1_login,
              player2_login: data.player2_login,
              status: "waiting",
            },
          });

          if (existingGame) {
            console.log("Game already exists, sending back existing game");
            ws.send(
              JSON.stringify({
                type: "game_created",
                game: existingGame,
              }),
            );
            return;
          }
          const newGame = await Game.create({
            player1_login: data.player1_login,
            player2_login: data.player2_login,
            player1_ships: data.player1_ships || {},
            player2_ships: data.player2_ships || {},
            current_turn:
              Math.random() < 0.5 ? data.player1_login : data.player2_login,
            status: "waiting",
            moves_history: [],
          });
          console.log("Game created with ID:", newGame.id);
          broadcast({
            type: "game_created",
            game: newGame,
          });
        } catch (error) {
          console.error("Error creating game:", error);
          ws.send(
            JSON.stringify({ type: "error", message: "Error creating game" }),
          );
        }
        break;
      case "delete_game":
        try {
          const game = await Game.findOne({
            where: { id: data.game_id },
          });
          if (!game) {
            return ws.send(
              JSON.stringify({ type: "error", message: "Game not found" }),
            );
          }
          await game.destroy();

          broadcast({
            type: "game_deleted",
            game_id: data.game_id,
          });
        } catch (error) {
          console.error("Error deleting game:", error);
          ws.send(
            JSON.stringify({ type: "error", message: "Error deleting game" }),
          );
        }
        break;
      case "get_game":
        try {
          const game = await Game.findOne({ where: { id: data.game_id } });
          if (!game) {
            return ws.send(
              JSON.stringify({ type: "error", message: "Game not found" }),
            );
          }
          ws.send(JSON.stringify({ type: "game_data", game }));
        } catch (error) {
          console.error("Error fetching game data:", error);
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Error fetching game data",
            }),
          );
        }
        break;
      case "update_game":
        try {
          const game = await Game.findOne({ where: { id: data.game_id } });
          if (!game) {
            return ws.send(
              JSON.stringify({ type: "error", message: "Game not found" }),
            );
          }
          const updatedMovesHistory = [
            ...game.moves_history,
            ...(data.updateFields.moves_history || []),
          ];
          const lastMove = updatedMovesHistory[updatedMovesHistory.length - 1];

          let nextTurn = game.current_turn;
          if (lastMove && lastMove.hit) {
            nextTurn = game.current_turn;
          } else {
            nextTurn =
              game.current_turn === game.player1_login
                ? game.player2_login
                : game.player1_login;
          }
          const updatedGameData = {
            ...game.dataValues,
            ...data.updateFields,
            moves_history: updatedMovesHistory,
            current_turn: nextTurn,
          };
          if (updatedGameData.player1_ready && updatedGameData.player2_ready) {
            await game.update({ status: "in_progress" });
            updatedGameData.status = "in_progress";
          }
          await game.update(updatedGameData);
          broadcast({ type: "game_updated", game: updatedGameData });

          if (updatedGameData.status === "in_progress") {
            const player1ShipsDestroyed = game.player1_ships.every(
              (ship) => ship.hit,
            );
            const player2ShipsDestroyed = game.player2_ships.every(
              (ship) => ship.hit,
            );

            if (player1ShipsDestroyed || player2ShipsDestroyed) {
              updatedGameData.status = "finished";
              updatedGameData.winner = player1ShipsDestroyed
                ? game.player2_login
                : game.player1_login;

              await game.update({
                status: "finished",
                winner: updatedGameData.winner,
              });

              broadcast({
                type: "game_finished",
                game: updatedGameData,
                winner: updatedGameData.winner,
              });
            }
          }
        } catch (error) {
          console.error("Error updating game:", error);
          ws.send(
            JSON.stringify({ type: "error", message: "Error updating game" }),
          );
        }
        break;

      case "check_hit":
        try {
          const game = await Game.findOne({ where: { id: data.game_id } });

          if (!game) {
            return ws.send(
              JSON.stringify({ type: "error", message: "Game not found" }),
            );
          }

          const playerShips =
            game.player1_login === data.player_login
              ? game.player2_ships
              : game.player1_ships;

          const isHit = playerShips.some(
            (ship) => ship.row === data.cell.row && ship.col === data.cell.col,
          );

          if (isHit) {
            playerShips.forEach((ship) => {
              if (ship.row === data.cell.row && ship.col === data.cell.col) {
                ship.hit = true;
              }
            });
          }

          const matchedShip = playerShips.find(
            (ship) => ship.row === data.cell.row && ship.col === data.cell.col,
          );

          const shotData = {
            row: data.cell.row,
            col: data.cell.col,
            hit: isHit,
            player_login: data.player_login,
            ship_id: matchedShip ? matchedShip.id : null,
          };

          broadcast({
            type: "check_hit",
            shot: shotData,
            gameId: game.id,
            targetPlayer:
              game.player1_login === data.player_login
                ? game.player2_login
                : game.player1_login,
          });

          await game.save();
        } catch (error) {
          console.error("Error checking hit:", error);
          ws.send(
            JSON.stringify({ type: "error", message: "Error checking hit" }),
          );
        }
        break;

      default:
        console.log("Unknown message type:", data.type);
        ws.send(
          JSON.stringify({ type: "error", message: "Unknown message type" }),
        );
        break;
    }
  });
  ws.on("close", () => {
    console.log("Client disconnected");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

function broadcast(data) {
  webSocketServer.clients.forEach((client) => {
    client.send(JSON.stringify(data));
  });
}

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected");
    server.listen(PORT, () => {
      console.log(
        `HTTP and WebSocket server is running on http://45.135.233.235:${PORT}`,
      );
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
