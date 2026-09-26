import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { API_URL } from "../config";

// Dịch các thông báo lỗi phổ biến từ backend
const translateError = (message) => {
  if (!message) return "Chưa tạo được tài khoản. Kiểm tra lại thông tin rồi thử lần nữa.";
  if (message.includes("Login name already used")) return "Tên đăng nhập này đã có người dùng. Hãy chọn tên khác.";
  if (message.includes("Email is already in use")) return "Email này đã được đăng ký. Bạn có thể đăng nhập bằng tài khoản cũ.";
  if (message.includes("Incorrect password")) return "Mật khẩu cần từ 4 đến 100 ký tự.";
  return message;
};

const emptyForm = {
  login: "",
  password: "",
  firstName: "",
  lastName: "",
  email: "",
  langKey: "vi",
  authorities: ["ROLE_OWNER"],
};

const Register = () => {
  const [formData, setFormData] = useState(emptyForm);
  const [message, setMessage] = useState(null); // { type: "success" | "error", text }
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Đã tạo tài khoản. Bạn có thể đăng nhập ngay." });
        setFormData(emptyForm);
      } else {
        let err = "";
        try {
          const data = await response.json();
          err = data.message;
        } catch {
          err = "";
        }
        setMessage({ type: "error", text: translateError(err) });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Không kết nối được tới máy chủ. Vui lòng thử lại sau ít phút." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Tạo tài khoản chủ nuôi"
      subtitle="Lưu hồ sơ thú cưng và đặt lịch khám chỉ trong vài phút."
      photo="/assets/hero-3.webp"
      photoAlt="Chú mèo đen trắng chơi đùa trên trụ cào móng"
      aside="Một hồ sơ cho mỗi bé, dùng lại cho mọi lần khám sau."
      footer={
        <>
          <span>
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </span>
          <Link to="/">Về trang chủ</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field-row">
          <div className="field">
            <label htmlFor="reg-first">Họ</label>
            <input
              id="reg-first"
              type="text"
              name="firstName"
              autoComplete="family-name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="reg-last">Tên</label>
            <input
              id="reg-last"
              type="text"
              name="lastName"
              autoComplete="given-name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="reg-login">Tên đăng nhập</label>
          <input
            id="reg-login"
            type="text"
            name="login"
            autoComplete="username"
            placeholder="Ví dụ: lan.nguyen"
            value={formData.login}
            onChange={handleChange}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            type="email"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="reg-password">Mật khẩu</label>
          <input
            id="reg-password"
            type="password"
            name="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            minLength={4}
            maxLength={100}
            required
          />
          <span className="field-hint">Từ 4 ký tự trở lên.</span>
        </div>

        {message && (
          <p className={`form-note is-${message.type}`} role={message.type === "error" ? "alert" : "status"}>
            {message.text} {message.type === "success" && <Link to="/login">Đăng nhập</Link>}
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Register;
