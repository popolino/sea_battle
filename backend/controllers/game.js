const { Game } = require("../models");

const createGame = async (req, res) => {
  const { player1_login, player2_login, player1_ships, player2_ships } =
    req.body;
  const randomTurn = Math.random() < 0.5 ? player1_login : player2_login;

  try {
    const newGame = await Game.create({
      player1_login,
      player2_login,
      player1_ready: false,
      player2_ready: false,
      player1_ships: player1_ships || {},
      player2_ships: player2_ships || {},
      current_turn: randomTurn,
      status: "waiting",
      moves_history: [],
    });
    return res.status(201).json(newGame);
  } catch (error) {
    console.error("Ошибка при создании игры:", error);
    return res.status(500).json({ error: "Не удалось создать игру" });
  }
};
const deleteGame = async (req, res) => {
  const { game_id } = req.body;
  try {
    const game = await Game.findOne({ where: { id: game_id } });
    if (!game) {
      return res.status(404).json({ error: "Игра не найдена" });
    }
    await game.destroy();
    return res.status(200).json({ message: "Игра успешно удалена" });
  } catch (error) {
    console.error("Ошибка при удалении игры:", error);
    return res.status(500).json({ error: "Не удалось удалить игру" });
  }
};
const getGame = async (req, res) => {
  const { game_id } = req.body;
  try {
    const game = await Game.findOne({ where: { id: game_id } });
    if (!game) {
      return res.status(404).json({ error: "Игра не найдена" });
    }
    return res.status(200).json({ game });
  } catch (error) {
    console.error("Ошибка при получении игры:", error);
    return res.status(500).json({ error: "Не удалось получить игру" });
  }
};

const updateGame = async (game_id, updateFields) => {
  const game = await Game.findOne({ where: { id: game_id } });
  if (!game) {
    throw new Error("Игра не найдена");
  }
  if (updateFields.moves_history) {
    game.moves_history = [...game.moves_history, ...updateFields.moves_history];
  }
  Object.keys(updateFields).forEach((key) => {
    if (key !== "moves_history" && updateFields[key] !== undefined) {
      game[key] = updateFields[key];
    }
  });
  const player1ShipsDestroyed = game.player1_ships.every((ship) => ship.hit);
  const player2ShipsDestroyed = game.player2_ships.every((ship) => ship.hit);

  if (player1ShipsDestroyed || player2ShipsDestroyed) {
    game.status = "finished";
    game.winner = player1ShipsDestroyed
      ? game.player2_login
      : game.player1_login;
    await game.save();
    return { game, winner: game.winner };
  }
  await game.save();
  return { game };
};

const checkHit = async (req, res) => {
  const { game_id, player_login, cell } = req.body;

  if (!cell || !cell.row || !cell.col) {
    return res.status(400).json({ error: "Invalid cell data" });
  }

  try {
    const game = await Game.findOne({ where: { id: game_id } });

    if (!game) {
      return res.status(404).json({ error: "Игра не найдена" });
    }

    const enemyShips =
      game.player1_login === player_login
        ? game.player2_ships
        : game.player1_ships;
    const matchedShip = enemyShips.find(
      (ship) => ship.row === cell.row && ship.col === cell.col
    );

    const hit = !!matchedShip;
    if (hit) {
      matchedShip.hit = true;
      await game.save();
    }
    const shotData = {
      hit,
      cell,
      player_login,
      ship_id: matchedShip ? matchedShip.id : null,
    };

    return res.status(200).json(shotData);
  } catch (error) {
    console.error("Ошибка при проверке попадания:", error);
    return res.status(500).json({ error: "Не удалось проверить попадание" });
  }
};

module.exports = {
  createGame,
  deleteGame,
  getGame,
  updateGame,
  checkHit,
};
