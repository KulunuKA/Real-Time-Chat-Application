import { combineReducers, configureStore } from "@reduxjs/toolkit";
import session from "redux-persist/lib/storage/session";
import { persistReducer, persistStore } from "redux-persist";
import userReducer from "./user";

const userConfig = {
  key: "user",
  storage: session,
  version: 1,
};

const createRootReducer = () =>
  combineReducers({
    user: persistReducer(userConfig, userReducer),
  });

const configureAppStore = () => {
  const rootReducer = createRootReducer();

  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};
export const store = configureAppStore();
export let persistor = persistStore(store);
