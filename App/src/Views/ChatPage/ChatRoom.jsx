import React, { useEffect, useState } from "react";
import { createChat } from "../../Apis/chat.apis";
import Loading from "../../components/Loading";
import socket from "../../Services/socket";
import { formatLastSeen } from "../../util/formatLastSeen";
import { useOneImgUpload } from "../../Hooks/useOneImgUpload";
import { notification } from "antd";
import EmojiPicker from "emoji-picker-react";
import { messageList, setMessagesList } from "../../store/user";
import { useDispatch, useSelector } from "react-redux";

export default function ChatRoom({
  id,
  dp,
  name,
  loggedInUser,
  onlineStatus,
  lastSeen,
}) {
  const usersId = {
    user1: loggedInUser,
    user2: id,
  };
  const msgList = useSelector(messageList);
  const sortedUsers = [usersId.user1, usersId.user2].sort();
  const chatId = sortedUsers.join("_");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const handleChat = async () => {
    try {
      const { data, code, msg } = await createChat(usersId);
      if (code !== 0) {
        console.error(msg);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleChat();
    const getMessages = msgList.filter((msg) => msg.chatId === chatId);
    setMessages(getMessages);
    setIsLoading(false);
  }, [id, msgList]);

  useEffect(() => {
    socket.emit("joinChat", { chatId, receiverId: id });

    const handleReceiveMessage = (data) => {
      dispatch(setMessagesList([data.data]));
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [chatId]);

  useEffect(() => {
    socket.on("deliveredMessagesStatus", (data) => {
      if (data.code === 0) {
        const updatedMessages = messages.map((msg) => {
          if (data.data.includes(msg._id)) {
            return { ...msg, status: "delivered" };
          }
          return msg;
        });
        dispatch(updatedMessages);
      }
    });
  }, [messages]);

  useEffect(() => {
    const readMessagesIds = messages
      .filter((msg) => msg.receiver === loggedInUser && msg.status !== "read")
      .map((msg) => msg._id);

    if (readMessagesIds.length > 0) {
      socket.emit("updateReadMessages", {
        chatId,
        messageIds: readMessagesIds,
      });
    }

    socket.on("readMessagesStatus", (data) => {
      console.log(data.data);
      if (data.code === 0) {
        const updatedMessages = messages.map((msg) => {
          if (data.data.includes(msg._id)) {
            return { ...msg, status: "read" };
          }
          return msg;
        });
        dispatch(updatedMessages);
      }
    });

    return () => {
      socket.off("readMessagesStatus");
    };
  }, [messages, loggedInUser, chatId]);

  return (
    <div className="chat-message-section">
      <div className="chat-message-header">
        <section>
          <img src={dp} alt="User" />
          <section>
            <p>{name}</p>
            <p>
              {onlineStatus === "online" ? "Online" : formatLastSeen(lastSeen)}
            </p>
          </section>
        </section>
        <section>
          <i className="fas fa-ellipsis-v"></i>
        </section>
      </div>
      <div className="chat-message-body">
        {isLoading ? (
          <Loading size={60} />
        ) : (
          messages.map((msg, index) => (
            <React.Fragment key={index}>
              {msg.messageType === "image" ? (
                <img
                  src={msg.content}
                  alt="Sent"
                  className="message-img"
                  style={
                    msg.sender === loggedInUser
                      ? { alignSelf: "flex-end" }
                      : { alignSelf: "flex-start" }
                  }
                  onLoad={() => window.scrollTo(0, document.body.scrollHeight)}
                />
              ) : (
                <div
                  className={`chat-message-${
                    msg.sender === loggedInUser ? "sent" : "received"
                  }`}
                >
                  <p>{msg.content}</p>
                  {msg.sender === loggedInUser && (
                    <small className="message-status">
                      {msg.status === "delivered" ? (
                        <div className="delivered">
                          <i className="fa fa-check"></i>
                          <i className="fa fa-check"></i>
                        </div>
                      ) : msg.status === "sent" ? (
                        <div className="sent">
                          <i className="fa fa-check"></i>
                        </div>
                      ) : msg.status === "read" ? (
                        <div className="read">
                          <i className="fa fa-check"></i>
                          <i className="fa fa-check"></i>
                        </div>
                      ) : null}
                    </small>
                  )}
                </div>
              )}
            </React.Fragment>
          ))
        )}
      </div>

      <ChatFooter chatId={chatId} loggedInUser={loggedInUser} id={id} />
    </div>
  );
}

const ChatFooter = React.memo(({ chatId, loggedInUser, id }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [message, setMessage] = useState({
    chatId,
    content: "",
    messageType: "text",
    sender: loggedInUser,
    receiver: id,
  });

  const sendMessage = async () => {
    // if (!message.content.trim() && message.messageType !== "image") return;

    try {
      if (message.messageType === "image") {
        const imageUrl = await useOneImgUpload({ file: message.content });
        if (imageUrl) {
          socket.emit("sendMessage", {
            chatId,
            senderId: loggedInUser,
            receiverId: id,
            content: imageUrl,
            messageType: "image",
          });
        }
      } else {
        socket.emit("sendMessage", {
          chatId,
          senderId: loggedInUser,
          receiverId: id,
          content: message.content,
          messageType: "text",
        });
      }
      setMessage((prev) => ({
        ...prev,
        content: "",
        messageType: "text",
      }));
      setImagePreview(null);
    } catch (error) {
      notification.error({
        message: "Failed to send message",
      });
    }
  };

  const handleInputChange = (e) => {
    setMessage((prev) => ({
      ...prev,
      content: e.target.value,
      messageType: "text",
    }));
  };

  const previewImg = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      setMessage((prev) => ({
        ...prev,
        messageType: "image",
        content: file,
      }));
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {imagePreview && (
        <div className="selected-img">
          <i
            className="fa fa-times"
            title="Remove Image"
            onClick={() => {
              setImagePreview(null);
              setMessage((prev) => ({
                ...prev,
                content: "",
                messageType: "text",
              }));
            }}
          ></i>
          <img src={imagePreview} alt="Selected" />
        </div>
      )}

      {/* Emoji */}
      <div className="selected-emoji">
        <EmojiPicker
          open={showEmoji}
          onEmojiClick={(e) => {
            setMessage((prev) => ({
              ...prev,
              content: prev.content + e.emoji,
              messageType: "text",
            }));
            setShowEmoji(false);
          }}
        />
      </div>

      <div className="chat-message-footer">
        <label
          className="emoji-icon"
          title="Emoji"
          onClick={() => setShowEmoji(!showEmoji)}
        >
          <i className="fa fa-smile emoji-icon" title="Emoji"></i>
        </label>
        <label className="attach-icon" title="Attach File">
          <i className="fa fa-paperclip"></i>
          <input type="file" accept="image/*" onChange={previewImg} />
        </label>
        <input
          type="text"
          placeholder="Type a message"
          value={message.messageType !== "image" ? message.content : ""}
          onChange={handleInputChange}
        />
        <i
          className="fa fa-paper-plane"
          title="Send Message"
          style={{ marginRight: 10 }}
          onClick={sendMessage}
        ></i>
        <i className="fa fa-microphone mic-icon" title="Voice Message"></i>
      </div>
    </div>
  );
});
