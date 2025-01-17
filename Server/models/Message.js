const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatId: { type: "String", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: { type: String, required: true },
  messageType: {
    type: String,
    enum: ["text", "image", "video", "audio", "document"],
    default: "text",
  },
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
});


module.exports = mongoose.model("Message", messageSchema);
