import React, { useEffect, useState } from "react";
import "./style.css";
import { useDispatch, useSelector } from "react-redux";
import { messageList, setMessagesList } from "../../store/user";
import { getChat } from "../../Apis/chat.apis";
import { formatLastMessageTime } from "../../util/formatLastSeen";

export default function ChatCard({ dp, name, onClick, id, loggedInUser }) {
  const msgList = useSelector(messageList);
  const sortedUsers = [id, loggedInUser].sort();
  const chatId = sortedUsers.join("_");
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [lastMessage, setLastMessage] = useState("");
  const [lastMsgTime, setLastMsgTime] = useState("");

  const fetchChatMessages = async () => {
    setIsLoading(true);
    try {
      const { data, code, msg } = await getChat(chatId);
      if (code === 0) {
        dispatch(setMessagesList(data.messages || []));
      } else {
        console.error(msg);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLastMessage = () => {
    const chatList = msgList.filter((msg) => msg.chatId === chatId);
    setLastMessage(chatList[chatList?.length - 1]?.content || "");
    setLastMsgTime(
      formatLastMessageTime(chatList[chatList?.length - 1]?.timestamp || "")
    );
  };

  useEffect(() => {
    fetchChatMessages();
  }, [id]);

  useEffect(() => {
    if (msgList.length > 0) {
      getLastMessage();
    }
  }, [msgList]);
  return (
    <div className="chat-card" onClick={onClick}>
      <div className="chat-img">
        <img src={dp} alt="User" />
      </div>

      <div className="chat-info">
        <p className="chat-name">{name}</p>
        <section className="chat-message-sec">
          <i className="fas fa-check"></i>
          <p className="chat-message">
            {lastMessage ? lastMessage : <i>No messages yet</i>}
          </p>
        </section>
      </div>

      <div className="chat-time">
        <p>{lastMsgTime}</p>
      </div>
    </div>
  );
}
