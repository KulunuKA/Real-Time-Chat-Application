import React, { useState, useEffect } from "react";
import ChatCard from "../../components/ChatCard";
import ProfileInfo from "./ProfileInfo";
import ChatRoom from "./ChatRoom";
import Loading from "../../components/Loading";
import logo from "../../assets/chat-logo.png";
import socket from "../../Services/socket";
import { getAllUsers } from "../../Apis/user.apis";
import { useDispatch, useSelector } from "react-redux";
import "./style.css";
import {
  setUserList,
  switchOnlineStatus,
  userInfo,
  userList,
} from "../../store/user";

export default function ChatPage() {
  const [showProfile, setShowProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const reduxUser = useSelector(userInfo);
  const userId = reduxUser?.id;
  const dispatch = useDispatch();
  const users = useSelector(userList);
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);
  const selectedUser = users[selectedUserIndex];

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, code, msg } = await getAllUsers();
      if (code === 0) {
        dispatch(setUserList(data));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!userId) return;

    // Emit userOnline event when the component mounts
    socket.emit("userOnline", userId);

    // handler for online users
    const handleOnlineUsers = (onlineUserIds) => {
      dispatch(switchOnlineStatus(onlineUserIds));
    };
    socket.on("onlineUsers", handleOnlineUsers);

    // Cleanup the event listener
    return () => {
      socket.off("onlineUsers", handleOnlineUsers);
    };
  }, [userId, selectedUserIndex]);

  useEffect(() => {
  }, [users]);

  return (
    <div style={{ position: "relative",overflow: "hidden"}}>
      <div className="chat-page">
        {/* Sidebar */}
        <div className="side-bar">
          <div className="side-bar-bottom">
            <img
              src={reduxUser?.profilePicture || logo}
              alt="User"
              onClick={() => setShowProfile(!showProfile)}
              style={{ cursor: "pointer" }}
            />
          </div>
        </div>

        {/* Chat List Section */}
        <div className="chat-list-section">
          <div className="chat-header">
            <section className="chat-header-top">
              <h2>Chat</h2>
              <div className="chat-add" title="Add Chat">
                <i className="fas fa-plus"></i>
              </div>
            </section>

            <section className="chat-header-bottom">
              <i className="fa fa-search"></i>
              <input type="text" placeholder="Search" />
            </section>
          </div>

          <div className="chat-list">
            {isLoading ? (
              <Loading size={30} />
            ) : (
              users
                .filter((user) => user.id !== userId)
                .map((user, index) => (
                  <ChatCard
                    key={user.id}
                    dp={user.profilePicture}
                    name={user.username}
                    onlineStatus={user.onlineStatus}
                    onClick={() => setSelectedUserIndex(index)}
                    id={user.id}
                    loggedInUser={userId}
                  />
                ))
            )}
          </div>
        </div>

        {/* Chat Room */}
        {!selectedUser ? (
          <div className="chat-message-wrapper">
            <img src={logo} alt="Chat Logo" />
            <p>Start chat...</p>
          </div>
        ) : (
          <ChatRoom
            id={selectedUser?.id}
            dp={selectedUser?.profilePicture}
            name={selectedUser?.username}
            onlineStatus={selectedUser?.onlineStatus}
            lastSeen={selectedUser?.lastSeen}
            loggedInUser={userId}
          />
        )}
      </div>

      {/* Profile Info */}
      {showProfile && <ProfileInfo onClose={() => setShowProfile(false)} />}
    </div>
  );
}
