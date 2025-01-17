import { Route, Routes } from "react-router-dom";
import Login from "./Views/Login/index";
import ChatPage from "./Views/ChatPage/index";
import Register from "./Views/Register/index";
import RequireRoute from "./route/requireRoute";
import Layout from "./components/Layout";

function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<RequireRoute />}>
            <Route path="/chat" element={<ChatPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
