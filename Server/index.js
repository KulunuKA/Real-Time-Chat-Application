require("dotenv").config();
require("./db/mongoose");
const http = require("http");
const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const router = require("./router/_index.routes");
const Chat = require("./models/Chat");
const Message = require("./models/Message");
const User = require("./models/User");
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(bodyParser.json());
app.use("/chatapp/", router);

const onlineUsers = new Map();

io.on("connection", (socket) => {
  // track user online status
  socket.on("userOnline", (userId) => {
    onlineUsers.set(userId, socket.id);
    const onlineUserArray = Array.from(onlineUsers.keys());
    console.log("User online:", onlineUserArray);
    io.emit("onlineUsers", onlineUserArray); // Broadcast all online users
  });

  socket.on("disconnect", async () => {
    // Handle user going offline
    console.log("User disconnected:", socket.id);
    const offlineUserId = [...onlineUsers.entries()].find(
      ([, id]) => id === socket.id
    )?.[0];
    console.log("User offline-->:", offlineUserId);
    if (offlineUserId) {
      onlineUsers.delete(offlineUserId);
      const onlineUserArray = Array.from(onlineUsers.keys());

      const user = await User.findByIdAndUpdate(
        offlineUserId,
        {
          onlineStatus: "offline",
          lastSeen: new Date(),
        },
        {
          new: true,
          upsert: true,
        }
      );
      user.save();

      io.emit("onlineUsers", onlineUserArray); // Broadcast updated online users
    }
  });

  socket.on("joinChat", async ({ chatId, receiverId }) => {
    socket.join(chatId);
    try {
      // check receiver online status
      const isReceiverOnline = onlineUsers.has(receiverId);

      if (isReceiverOnline) {
        await Message.updateMany(
          { chatId, receiver: receiverId, status: "sent" },
          { status: "delivered" }
        );
      }

      const deliveredMessages = await Message.find({
        chatId,
        status: "delivered",
      });
      const deletedMessagesIds = deliveredMessages.map((msg) => msg._id);

      io.to(chatId).emit("deliveredMessagesStatus", {
        data: deletedMessagesIds,
        code: 0,
        msg: "Delivered messages",
      });
    } catch (error) {
      console.error("Error in joinChat:", error);
    }
    console.log(`User joined chat: ${chatId}`);
  });

  socket.on(
    "sendMessage",
    async ({ chatId, senderId, receiverId, content, messageType }) => {
      console.log(chatId, senderId, receiverId, content, messageType);
      try {
        const isReceiverOnline = onlineUsers.has(receiverId);
        // Create and save a new message
        const newMessage = new Message({
          chatId,
          sender: senderId,
          receiver: receiverId,
          content,
          messageType,
          status: isReceiverOnline ? "delivered" : "sent",
        });

        await newMessage.save();

        // Update the chat document
        await Chat.findOneAndUpdate(
          { chatId },
          {
            $push: { messages: newMessage._id },
            lastUpdated: new Date(),
          },
          {
            new: true,
            upsert: true, // Create the document if it doesn't exist
          }
        );

        // Emit the message to the specific chat room
        io.to(chatId).emit("receiveMessage", {
          data: newMessage,
          code: 0,
          msg: "Message sent successfully",
        });
      } catch (error) {
        console.error("Error in sendMessage:", error);
        io.to(chatId).emit("receiveMessageError", {
          code: 1,
          msg: "Failed to send message",
        });
      }
    }
  );

  socket.on("updateReadMessages", async ({ chatId, messageIds }) => {
    try {
      if (!messageIds || messageIds.length === 0) return;

      await messageIds.forEach(async (msgId) => {
        await Message.updateMany(
          {
            chatId,
            _id: msgId,
          },
          {
            status: "read",
          }
        );
      });

      const readMessages = await Message.find({
        chatId,
        _id: { $in: messageIds },
        status: "read",
      });
      const readMessagesIds = readMessages.map((msg) => msg._id);

      io.to(chatId).emit("readMessagesStatus", {
        data: readMessagesIds,
        code: 0,
        msg: "Read messages",
      });
    } catch (error) {
      console.error("Error in updateReadMessages:", error);
    }
  });
});

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
