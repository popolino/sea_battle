"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "Ships",
      [
        {
          name: "4x cage",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "3x cage",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "2x cage",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "1x cage",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Ships", null, {});
  },
};
