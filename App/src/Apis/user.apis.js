import axiosInstance from "../Services/axios instance";

const header = {
  "Content-Type": "application/json",
  Authorization: "",
};

const options = {
  headers: header,
};

export const loginUser = async (data) => {
  return await axiosInstance.post("/user/login", data);
};

export const registerUser = async (data) => {
  return await axiosInstance.post("/user/register", data);
};

export const updateUser = async (data) => {
  return await axiosInstance.put("/user/update", data, options);
};

export const getAllUsers = async () => {
  return await axiosInstance.get("/user/all", options);
};
