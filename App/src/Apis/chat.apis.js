import axiosInstance from "../Services/axios instance";

const headers = {
  "Content-Type": "application/json",
  Authorization: "",
};

const options = {
  headers: headers,
};

export const createChat = async (data) => {
  return await axiosInstance.post("/chat/create", data, options);
};

export const getChat = async (chatId) => {
  return await axiosInstance.get(`/chat/get/${chatId}`, options);
};
