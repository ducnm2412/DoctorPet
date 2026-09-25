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
          ? "Cập nhật thành công!"
          : "Thêm trợ lý thành công!",
        icon: "success",
      });
      props.onCreated?.();
    } else {
      Swal.fire({ title: "Lỗi!", icon: "error" });
    }
  };

  return (
    <div className="main-container">
      <div className="add-sup-container">
        <h2>Thêm Trợ Lý</h2>

        <form onSubmit={handleSubmit} className="sup-form">
          <div className="name-row">
            <input
              type="text"
              name="firstName"
              placeholder="Họ"
              value={form.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Tên"
              value={form.lastName}
              onChange={handleChange}
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="login"
            placeholder="Tên đăng nhập"
            value={form.login}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit">{props.assistant ? "Cập nhật" : "Thêm"}</button>
          <button type="button" onClick={props.onCancel}>
            Hủy
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddSup;
