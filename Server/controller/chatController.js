const Chat = require("../models/Chat");
const Message = require("../models/Message");

const createChat = async (req, res) => {
  try {
    const { user1, user2 } = req.body;
    if (!user1 || !user2) {
      return res.status(400).send({
        data: {},
        code: 1,
        msg: "Both users are required",
      });
    }

    const sortedUsers = [user1, user2].sort();
    const chatId = sortedUsers.join("_");

    const chat = await Chat.findOne({ chatId });

    if (!chat) {
      const newChat = await Chat({
        chatId,
        participants: sortedUsers,
      });
      await newChat.save();
    }

    res.status(201).send({
      data: {
        participants: sortedUsers,
        id: chatId,
      },
      code: 0,
      msg: "Chat created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      data: {},
      code: 1,
      msg: "Server error",
    });
  }
};

const getChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    if (!chatId) {
      return res.status(400).send({
        data: {},
        code: 1,
        msg: "Chat ID is required",
      });
    }

    const chat = await Chat.findOne({ chatId }, "messages").populate(
      "messages"
    );

    if (!chat) {
      return res.status(404).send({
        data: {},
        code: 1,
        msg: "Chat not found",
      });
    }

    res.status(200).send({
      data: chat,
      code: 0,
      msg: "Chat found",
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      data: {},
      code: 1,
      msg: "Server error",
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { chatId, sender, receiver, content } = req.body;
    if (!chatId || !sender || !receiver || !content) {
      return res.status(400).send({
        data: {},
        code: 1,
        msg: "All fields are required",
      });
    }

    const newMessage = new Message({
      chatId,
      sender,
      receiver,
      content,
    });
    await newMessage.save();

    await Chat.findOneAndUpdate(
      chatId,
      {
        $push: { messages: newMessage._id },
        lastUpdated: new Date(),
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.status(201).send({
      data: newMessage,
      code: 0,
      msg: "Message sent successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      data: {},
      code: 1,
      msg: "Server error",
    });
  }
};

module.exports = { createChat, getChat, sendMessage };
