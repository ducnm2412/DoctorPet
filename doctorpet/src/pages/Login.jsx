import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { getHomePathFor } from "../components/navigation";
import { API_URL } from "../config";

const Login = () => {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSubmitting(true);

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
        setErrorMessage("Tên đăng nhập hoặc mật khẩu chưa đúng. Kiểm tra lại rồi thử lần nữa.");
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

      window.location.href = getHomePathFor(account);
    } catch (error) {
      console.error(error);
      setErrorMessage("Không kết nối được tới máy chủ. Vui lòng thử lại sau ít phút.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để xem lịch hẹn, hồ sơ thú cưng và tin nhắn từ bác sĩ."
      photo="/assets/hero-1.webp"
      photoAlt="Một cô gái ôm chú chó golden và chú corgi"
      aside="Bác sĩ đọc hồ sơ của bé trước khi bạn đến, nên buổi khám luôn nhẹ nhàng hơn."
      footer={
        <>
          <span>
            Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
          </span>
          <Link to="/">Về trang chủ</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {errorMessage && (
          <p className="form-note is-error" role="alert">
            {errorMessage}
          </p>
        )}

        <div className="field">
          <label htmlFor="login-username">Tên đăng nhập</label>
          <input
            id="login-username"
            type="text"
            autoComplete="username"
            placeholder="Ví dụ: lan.nguyen"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="login-password">Mật khẩu</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
