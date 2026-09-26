import React from "react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "../css/AddSup.css";
import { API_URL } from "../../config";
const AddSup = (props) => {
  const [form, setForm] = useState({
    login: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    langKey: "vi",
    authorities: ["ROLE_ASSISTANT"],
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  useEffect(() => {
    if (props.assistant) {
      setForm({
        login: props.assistant.login || "",
        password: "", // không bao giờ trả password từ backend
        firstName: props.assistant.firstName || "",
        lastName: props.assistant.lastName || "",
        email: props.assistant.email || "",
        langKey: "vi",
        authorities: ["ROLE_ASSISTANT"],
      });
    }
  }, [props.assistant]);
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = props.assistant
      ? `${API_URL}/api/vets/assistants/${props.assistant.id}`
      : `${API_URL}/api/vets/assistants`;

    const method = props.assistant ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      Swal.fire({
        title: props.assistant
          ? "Đã lưu thông tin trợ lý"
          : "Đã tạo tài khoản trợ lý",
        icon: "success",
      });
      props.onCreated?.();
    } else {
      Swal.fire({
        title: "Chưa lưu được",
        text: "Tên đăng nhập hoặc email có thể đã được dùng. Kiểm tra lại rồi thử lần nữa.",
        icon: "error",
      });
    }
  };

  const isEditing = Boolean(props.assistant);

  return (
    <div
      className="main-container"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) props.onCancel?.();
      }}
    >
      <div
        className="add-sup-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-sup-title"
      >
        <div className="add-sup-head">
          <h2 id="add-sup-title">{isEditing ? "Sửa thông tin trợ lý" : "Thêm trợ lý"}</h2>
          <button type="button" className="add-sup-close" onClick={props.onCancel} aria-label="Đóng">
            <i className="ri-close-line" aria-hidden="true"></i>
          </button>
        </div>
        <p className="add-sup-intro">
          {isEditing
            ? "Cập nhật thông tin đăng nhập của trợ lý."
            : "Trợ lý dùng tài khoản này để đăng nhập và xem các ca khám được giao."}
        </p>

        <form onSubmit={handleSubmit} className="sup-form">
          <div className="name-row">
            <div className="field">
              <label htmlFor="sup-first">Họ</label>
              <input
                id="sup-first"
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="sup-last">Tên</label>
              <input
                id="sup-last"
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="sup-email">Email</label>
            <input
              id="sup-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="sup-login">Tên đăng nhập</label>
            <input
              id="sup-login"
              type="text"
              name="login"
              value={form.login}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="sup-password">{isEditing ? "Mật khẩu mới" : "Mật khẩu"}</label>
            <input
              id="sup-password"
              type="password"
              name="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="button-group">
            <button type="button" className="btn btn-quiet" onClick={props.onCancel}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? "Lưu thay đổi" : "Tạo tài khoản trợ lý"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSup;
