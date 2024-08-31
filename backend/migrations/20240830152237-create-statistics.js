"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Statistics", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      game_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      wins: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      loses: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      destroyed_ship1: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      destroyed_ship2: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      destroyed_ship3: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      destroyed_ship4: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Statistics");
  },
};
