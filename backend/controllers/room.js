const { Room } = require("../models");

const createRoom = async (req, res) => {
  const { room_id, name, player1 } = req.body;
  try {
    const room = await Room.create({
      room_id,
      name,
      player1,
      status: "waiting",
    });
    res.status(201).json(room);
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const addUserToRoom = async (req, res) => {
  const { room_id, player2 } = req.body;
  try {
    const room = await Room.findOne({ where: { room_id } });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    room.player2 = player2;
    room.status = "playing";
    await room.save();
    res.status(200).json(room);
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll();
    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
const deleteRoom = async (req, res) => {
  try {
    const { room_id } = req.body;
    const room = await Room.findOne({ where: { room_id } });
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }
    await room.destroy();
    res.status(200).json(room);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = {
  createRoom,
  addUserToRoom,
  getRooms,
  deleteRoom,
};
