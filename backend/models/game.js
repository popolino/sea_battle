"use strict";
module.exports = (sequelize, DataTypes) => {
  const Game = sequelize.define(
    "Game",
    {
      player1_login: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      player2_login: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      player1_ready: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      player2_ready: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      player1_ships: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      player2_ships: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      current_turn: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "waiting",
      },
      moves_history: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {}
  );

  return Game;
};
