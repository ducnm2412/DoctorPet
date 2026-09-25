import React, { useState } from "react";
import "../css/Login.css";
import { API_URL } from "../config";

const Login = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");

    try {
      const response = await fetch(`${API_URL}/api/authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: login,
          password: password,
          rememberMe: true,
        }),
      });

      if (!response.ok) {
        setErrorMessage("Sai tài khoản hoặc mật khẩu!");
        return;
      }

      const data = await response.json();
      const accountRes = await fetch(`${API_URL}/api/account`, {
        headers: {
          Authorization: `Bearer ${data.id_token}`,
        },
      });

      const account = await accountRes.json();
      localStorage.setItem("user", JSON.stringify(account));
      localStorage.setItem("jwt", data.id_token);

      const authorities = account.authorities || [];
      console.log("AUTHORITIES:", authorities); // log kiểm tra

      if (authorities.includes("ROLE_USER")) {
        window.location.href = "/user";
      } else if (authorities.includes("ROLE_DOCTOR")) {
        window.location.href = "/vet";
      } else if (authorities.includes("ROLE_ASSISTANT")) {
        window.location.href = "/support";
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Không thể kết nối server!");
    }
  };

  return (
    <div className="login-body">
      <div className="login-container">
        <h2>Đăng Nhập</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="form-group">
            <label>Tài khoản (username)</label>
            <input
              type="text"
              placeholder="Nhập username"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login">
            Đăng Nhập
          </button>

          <p className="register-link">
            Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
          </p>
          <a href="/">Trở về trang chủ</a>
        </form>
      </div>
    </div>
  );
};

export default Login;
