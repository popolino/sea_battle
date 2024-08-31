module.exports = (sequelize, DataTypes) => {
  const Statistic = sequelize.define(
    "Statistic",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      game_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      wins: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      loses: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      destroyed_ship1: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      destroyed_ship2: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      destroyed_ship3: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      destroyed_ship4: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {}
  );

  Statistic.associate = function (models) {
    Statistic.belongsTo(models.User, { foreignKey: "userId", as: "user" });
  };

  return Statistic;
};
