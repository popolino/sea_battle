module.exports = (sequelize, DataTypes) => {
  const Ship = sequelize.define(
    "Ship",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {}
  );

  return Ship;
};
