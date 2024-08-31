"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Games", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      player1_login: {
        type: Sequelize.STRING,
      },
      player2_login: {
        type: Sequelize.STRING,
      },
      player1_ready: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      player2_ready: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      player1_ships: {
        type: Sequelize.JSON,
      },
      player2_ships: {
        type: Sequelize.JSON,
      },
      current_turn: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING,
      },
      moves_history: {
        type: Sequelize.JSON,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Games");
  },
};
