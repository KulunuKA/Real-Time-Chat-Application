import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo: {},
  userList: [],
  message: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },
    setUserList: (state, action) => {
      const newUsers = action.payload.filter(
        (user) =>
          !state.userList.some((exitingUser) => exitingUser.id === user.id) &&
          state.userInfo.id != user.id
      );
      state.userList = [...state.userList, ...newUsers];
    },
    switchOnlineStatus: (state, action) => {
      const userIDs = action.payload;
      state.userList = state.userList.map((user) =>
        userIDs.includes(user.id)
          ? { ...user, onlineStatus: "online" }
          : { ...user, onlineStatus: "offline" }
      );
    },
    setMessagesList: (state, action) => {
      const newMessage = action.payload.filter((msg) =>
        state.message.every((existingMsg) => existingMsg._id !== msg._id)
      );
      state.message = [...state.message, ...newMessage];
    },

    clearUserStore: (state) => {
      state.userInfo = {};
      state.userList = [];
      state.message = [];
    },
  },
});

export const {
  setUserInfo,
  setUserList,
  switchOnlineStatus,
  clearUserStore,
  setMessagesList,
} = userSlice.actions;
export const userInfo = (state) => state.user.userInfo;
export const userList = (state) => state.user.userList;
export const messageList = (state) => state.user.message;
export default userSlice.reducer;
