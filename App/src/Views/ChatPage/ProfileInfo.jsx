import React, { useState } from "react";
import { notification, Upload } from "antd";
import Loading from "../../components/Loading";
import { useOneImgUpload } from "../../Hooks/useOneImgUpload";
import { updateUser } from "../../Apis/user.apis";
import { clearUserStore, setUserInfo, userInfo } from "../../store/user";
import { useDispatch, useSelector } from "react-redux";
import { switchOnlineStatus } from "../../store/user";
import socket from "../../Services/socket";

const ProfileInfo = ({ onClose }) => {
  const reduxUser = useSelector(userInfo);
  const [imgLoading, setImgUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const [user, setUser] = useState({
    id: reduxUser.id || "",
    username: reduxUser.username || "",
    email: reduxUser.email || "",
    profilePicture: reduxUser.profilePicture || "",
  });

  const handleInputChange = (field) => (e) => {
    setUser({ ...user, [field]: e.target.value });
  };

  // update user profile picture
  const handleLogoFile = async ({ file }) => {
    setImgUploading(true);
    const imageUrl = await useOneImgUpload({ file });
    setUser({ ...user, profilePicture: imageUrl });
    setImgUploading(false);
  };

  // update user profile
  const handleUpdateProfile = async () => {
    try {
      if (!user.email || !user.username) {
        notification.error({
          message: "Email and username are required",
        });
        return;
      }
      setIsLoading(true);

      const { data, msg, code } = await updateUser(user);
      if (code === 0) {
        notification.success({
          message: msg,
        });
        dispatch(setUserInfo(data));
        onClose();
      } else {
        notification.error({
          message: msg,
        });
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      notification.error({
        message: "Something went wrong",
      });
    }
  };

  const logout = () => {
    const handleOnlineUsers = (onlineUserIds) => {
      dispatch(switchOnlineStatus(onlineUserIds));
    };
    socket.on("disconnect", handleOnlineUsers);
    dispatch(clearUserStore());
    window.location.reload();
  };

  return (
    <div className="profile-info">
      <div className="profile-info-img">
        <Upload
          customRequest={({ file }) => handleLogoFile({ file })}
          showUploadList={false}
        >
          <div>
            {imgLoading ? (
              <Loading size={34} />
            ) : (
              <img
                src={
                  user.profilePicture ||
                  "https://th.bing.com/th/id/OIP.jBJGmYcfuznJ-mwzRSYpOwHaHa?w=1024&h=1024&rs=1&pid=ImgDetMain"
                }
                alt="TEST_LOGO"
              />
            )}
          </div>
        </Upload>
      </div>
      <div className="profile-info-text">
        <input
          type="text"
          value={user.username}
          onChange={handleInputChange("username")}
        />
        <i className="fa fa-pencil-alt"></i>
      </div>
      <div className="profile-info-text">
        <input
          type="email"
          value={user.email}
          onChange={handleInputChange("email")}
        />
        <i className="fa fa-pencil-alt"></i>
      </div>
      <hr />

      <section className="profile-info-buttons">
        <button className="logout" onClick={logout}>
          <i className="fa fa-sign-out-alt"></i> Logout
        </button>
        {(user.email !== reduxUser.email ||
          user.username !== reduxUser.username ||
          user.profilePicture !== reduxUser.profilePicture) &&
          (isLoading ? (
            <Loading size={20} />
          ) : (
            <button className="done" onClick={handleUpdateProfile}>
              Done
            </button>
          ))}
      </section>
    </div>
  );
};

export default ProfileInfo;
