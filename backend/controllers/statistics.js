const { User, Statistic} = require("../models");
const { sequelize } = require("../models");
const getStatistic = async (req, res) => {
  try {
    const userId = req.params.id;

    const statistic = await Statistic.findOne({
      where: { userId: userId },
    });

    if (!statistic) {
      return res.status(404).json({ error: "Statistic not found" });
    }

    const shipsStats = {
      "4x cage": statistic.destroyed_ship4 || 0,
      "3x cage": statistic.destroyed_ship3 || 0,
      "2x cage": statistic.destroyed_ship2 || 0,
      "1x cage": statistic.destroyed_ship1 || 0,
    };

    const totalShipsDestroyed =
      (statistic.destroyed_ship4 || 0) +
      (statistic.destroyed_ship3 || 0) +
      (statistic.destroyed_ship2 || 0) +
      (statistic.destroyed_ship1 || 0);

    const response = {
      user_id: statistic.userId,
      game_count: statistic.game_count || 0,
      wins: statistic.wins || 0,
      loses: statistic.loses || 0,
      ships_destroyed: totalShipsDestroyed,
      ships_stats: shipsStats,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching statistic:", error);
    return res.status(500).json({ error: "Failed to fetch statistic" });
  }
};

const updateStatistic = async (req, res) => {
  try {
    const userId = req.params.id;
    const { wins, loses, shipsDestroyed } = req.body;

    const statistic = await Statistic.findOne({ where: { userId: userId } });

    if (!statistic) {
      return res.status(404).json({ error: "Statistic not found" });
    }

    statistic.game_count += 1;

    if (wins !== undefined) statistic.wins += wins;
    if (loses !== undefined) statistic.loses += loses;

    if (shipsDestroyed && Array.isArray(shipsDestroyed)) {
      shipsDestroyed.forEach((ship) => {
        if (ship.id === "ship1") statistic.destroyed_ship1 += ship.destroyed;
        if (ship.id === "ship2") statistic.destroyed_ship2 += ship.destroyed;
        if (ship.id === "ship3") statistic.destroyed_ship3 += ship.destroyed;
        if (ship.id === "ship4") statistic.destroyed_ship4 += ship.destroyed;
      });
    }

    await statistic.save();

    return res
      .status(200)
      .json({ message: "Statistic updated successfully", statistic });
  } catch (error) {
    console.error("Error updating statistic:", error);
    return res.status(500).json({ error: "Failed to update statistic" });
  }
};

const getPlayersRating = async (req, res) => {
  try {
    const players = await Statistic.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name"],
          as: "user",
        },
      ],
      attributes: [
        "userId",
        "wins",
        "game_count",
        [
          sequelize.literal(
            "ROUND(CASE WHEN game_count > 0 THEN (wins::float / game_count) * 100 ELSE 0 END::numeric, 1)"
          ),
          "win_percentage",
        ],
      ],
      order: [[sequelize.literal("win_percentage"), "DESC"]],
    });

    const response = players.map((player) => ({
      user_id: player.user.id,
      name: player.user.name,
      wins: player.wins,
      game_count: player.game_count,
      win_percentage: player.get("win_percentage"),
    }));

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching players rating:", error.message, error.stack);
    return res.status(500).json({ error: "Failed to fetch players rating" });
  }
};

module.exports = { getStatistic, updateStatistic, getPlayersRating };
