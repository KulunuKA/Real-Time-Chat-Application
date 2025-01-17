const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  chatId: { type: String, required: true, unique: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Chat", chatSchema);
