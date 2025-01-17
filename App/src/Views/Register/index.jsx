import React, { useEffect, useState } from "react";
import loginImg from "../../assets/login.jpg";
import IconInput from "../../components/IconInput";
import googleLogo from "../../assets/google-logo.png";
import fbLogo from "../../assets/facebook-logo.png";
import { notification } from "antd";
import Loading from "../../components/Loading";
import { registerUser } from "../../Apis/user.apis";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../../store/user";

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    username: "",
    password: "",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleInput = (field) => (e) => {
    setCredentials({ ...credentials, [field]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      if (
        !credentials.email ||
        !credentials.password ||
        !credentials.username
      ) {
        notification.error({
          message: "Fill all fields!",
        });
        return;
      }

      setIsLoading(true);

      const { data, code, msg } = await registerUser(credentials);
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
          <p className="login-header">Register</p>
          <p className="sub">
            Register to your account and start chatting with your friends!
          </p>

          <IconInput
            icon={<i className="fas fa-user"></i>}
            placeholder={"User Name"}
            onChange={handleInput("username")}
          />
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
              <button className="login-btn" onClick={handleRegister}>
                Register
              </button>
            )}
          </section>
        </div>
        <div className="login-form-bottom">
          <p>Signup With</p>
          <SocialLogin icon={googleLogo} title={"Login with google"} />
          <SocialLogin icon={fbLogo} title={"Login with facebook"} />
        </div>

        <p>
          {" "}
          Already have an account? <a href="/">Sign in</a>
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
