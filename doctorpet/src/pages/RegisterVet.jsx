import React, { useState } from "react";
import "../css/Register.css";
import Swal from "sweetalert2";
import { API_URL } from "../config";

const RegisterVet = () => {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    langKey: "vi",
    licenseNumber: "",
    specialization: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/register-vet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.status === 201) {
        Swal.fire({
          icon: "success",
          title: "Thành công!",
          text: "Đăng ký bác sĩ thành công!",
          confirmButtonText: "OK",
        });
        setFormData({
          login: "",
          password: "",
          firstName: "",
          lastName: "",
          email: "",
          langKey: "vi",
          licenseNumber: "",
          specialization: "",
        });
      } else {
        let errMsg = "Đăng ký thất bại — kiểm tra dữ liệu đầu vào.";
        try {
          const data = await res.json();
          if (data.message) errMsg = data.message;
        } catch {
          errMsg = "Đăng ký thất bại — kiểm tra dữ liệu đầu vào.";
        }
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: errMsg,
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Lỗi kết nối đến server!",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="register-body">
      <div className="register-container">
        <h2>Đăng Ký Bác Sĩ</h2>
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ</label>
            <input
              type="text"
              name="lastName"
              placeholder="Họ"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Tên</label>
            <input
              type="text"
              name="firstName"
              placeholder="Tên"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input
              type="text"
              name="login"
              placeholder="Tên đăng nhập"
              value={formData.login}
              onChange={handleChange}
              required
              pattern="^[_.@A-Za-z0-9-]+$"
              title="Tên đăng nhập chỉ chứa chữ, số, dấu _ . @ -"
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu (4-100 ký tự)"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={4}
              maxLength={100}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Số giấy phép hành nghề</label>
            <input
              type="text"
              name="licenseNumber"
              placeholder="Số giấy phép hành nghề"
              value={formData.licenseNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Chuyên môn</label>
            <input
              type="text"
              name="specialization"
              placeholder="Chuyên môn"
              value={formData.specialization}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-register">
            Đăng Ký
          </button>

          <p className="login-link">
            Đã có tài khoản? <a href="/login">Đăng nhập</a>
          </p>
          <a href="/">Trở về trang chủ</a>
        </form>
      </div>
    </div>
  );
};

export default RegisterVet;
