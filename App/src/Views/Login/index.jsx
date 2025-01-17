import React, { useEffect, useState } from "react";
import loginImg from "../../assets/login.jpg";
import IconInput from "../../components/IconInput";
import googleLogo from "../../assets/google-logo.png";
import fbLogo from "../../assets/facebook-logo.png";
import { Checkbox, notification } from "antd";
import "./style.css";
import Loading from "../../components/Loading";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../Apis/user.apis";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../../store/user";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const handleInput = (field) => (e) => {
    setCredentials({ ...credentials, [field]: e.target.value });
  };
  const dispatch = useDispatch();

  const handleLogin = async () => {
    try {
      if (!credentials.email || !credentials.password) {
        notification.error({
          message: "Fill all fields!",
        });
        return;
      }

      setIsLoading(true);

      const { data, code, msg } = await loginUser(credentials);
      if (code == 0) {
        dispatch(setUserInfo(data));
        navigate("/chat");
      } else {
        notification.error({
          message: msg,
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      notification.error({
        message: error.response.data.msg || "Something went wrong!",
      });
    }
  };

  const handleLoggedUserRoute = () => {
    const userData = JSON.parse(sessionStorage.getItem("data"));
    if (userData != null) {
      navigate("/chat");
    }
  };

  useEffect(() => {
    handleLoggedUserRoute();
  }, []);

  return (
    <div className="login">
      <div className="login-img">
        <img src={loginImg} alt="Login" />
      </div>

      <div className="login-form">
        <div className="login-form-top">
          <p className="login-header">Login</p>
          <p className="sub">
            Login to your account and start chatting with your friends!
          </p>

          <IconInput
            icon={<i className="fas fa-envelope"></i>}
            placeholder={"Email"}
            onChange={handleInput("email")}
          />
          <IconInput
            icon={<i className="fas fa-lock"></i>}
            placeholder={"Password"}
            type={"password"}
            onChange={handleInput("password")}
          />

          <section className="login-form-btn">
            {isLoading ? (
              <Loading size={40} />
            ) : (
              <button className="login-btn" onClick={handleLogin}>
                Login
              </button>
            )}
          </section>
        </div>
        <div className="login-form-bottom">
          <p>Login With</p>
          <SocialLogin icon={googleLogo} title={"Login with google"} />
          <SocialLogin icon={fbLogo} title={"Login with facebook"} />
        </div>

        <p>
          You don't have an account <a href="/register">register</a>
        </p>
      </div>
    </div>
  );
}

const SocialLogin = ({ icon, title }) => {
  return (
    <section className="google-login">
      <img src={icon} style={{ width: 28, height: 28 }} />
      <p>{title}</p>
    </section>
  );
};
