import { store } from "../store/store";

export const AuthService = {
  getTokens: () => {
    const { token } = store.getState().user.userInfo;
    return token;
  },
  setTokens: (token) => {
    sessionStorage.setItem("data", JSON.stringify({ token }));
  },
  logout: () => {
    sessionStorage.removeItem("data");
  },
};
