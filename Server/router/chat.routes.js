const { Router } = require("express");
const {
  createChat,
  getChat,
  sendMessage,
} = require("../controller/chatController");
const auth = require("../middleware/auth");
const router = Router();
const ChatRouter = router;

ChatRouter.post("/create", auth, createChat);
ChatRouter.get("/get/:chatId", auth, getChat);
ChatRouter.post("/addmessage", auth, sendMessage);

module.exports = ChatRouter;
