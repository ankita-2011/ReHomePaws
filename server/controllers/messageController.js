import Message from "../models/Message.js";

export const sendMessage = async (req, res) => {
  try {
    const { name, email, phone, query } = req.body;

    if (!name || !email || !query) {
      return res.status(400).json("Name, email and query are required");
    }

    await Message.create({ name, email, phone, query });
    res.status(201).json("Message sent successfully");
  } catch (err) {
    console.log(err);
    res.status(500).json("Server error");
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.log(err);
    res.status(500).json("Server error");
  }
};
