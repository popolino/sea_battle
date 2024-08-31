"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await queryInterface.bulkInsert(
      "Users",
      [
        {
          name: "John Doe",
          login: "johndoe@gmail.com",
          password: "1234",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      { returning: true }
    );

    const statistics = users.map((user) => ({
      game_count: 0,
      wins: 0,
      loses: 0,
      destroyed_ship1: 0,
      destroyed_ship2: 0,
      destroyed_ship3: 0,
      destroyed_ship4: 0,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert("Statistics", statistics, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Statistics", null, {});
    await queryInterface.bulkDelete("Users", null, {});
  },
};
