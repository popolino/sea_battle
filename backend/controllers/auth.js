const { User, Statistic } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signUp = async (req, res) => {
  try {
    const { login, name, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ login, name, password: hashedPassword });
    await Statistic.create({
      userId: user.id,
      game_count: 0,
      wins: 0,
      loses: 0,
    });
    const token = jwt.sign({ id: user.id }, "your_jwt_secret_key", {
      expiresIn: "1h",
    });
    res.status(201).json({ token, user: user });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const signIn = async (req, res) => {
  try {
    const { login, password } = req.body;
    const user = await User.findOne({ where: { login } });
    if (!user || !(await user.validPassword(password))) {
      return res.status(401).json({ error: "Invalid login or password" });
    }
    const token = jwt.sign({ id: user.id }, "your_jwt_secret_key", {
      expiresIn: "1h",
    });
    const userData = {
      id: user.id,
      name: user.name,
      login: user.login,
    };
    res.status(200).json({ token, user: userData });
  } catch (error) {
    console.error("Error during user login:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const logout = (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
const getUserByLogin = async (req, res) => {
  const { login } = req.params;
  try {
    const user = await User.findOne({ where: { login } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = {
  signUp,
  signIn,
  logout,
  getAllUsers,
  getUserByLogin,
};
