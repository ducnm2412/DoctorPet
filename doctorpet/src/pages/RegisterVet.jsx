import React, { useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import AuthLayout from "../components/AuthLayout";
import { API_URL } from "../config";

const emptyForm = {
  login: "",
  password: "",
  firstName: "",
  lastName: "",
  email: "",
  langKey: "vi",
  licenseNumber: "",
  specialization: "",
};

const RegisterVet = () => {
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
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
          title: "Đã tạo tài khoản bác sĩ",
          text: "Bạn có thể đăng nhập để bắt đầu nhận lịch hẹn.",
          confirmButtonText: "Đăng nhập",
        }).then((result) => {
          if (result.isConfirmed) window.location.href = "/login";
        });
        setFormData(emptyForm);
      } else {
        let errMsg = "Chưa tạo được tài khoản. Kiểm tra lại thông tin rồi thử lần nữa.";
        try {
          const data = await res.json();
          if (data.message) errMsg = data.message;
        } catch {
          // giữ thông báo mặc định
        }
        Swal.fire({
          icon: "error",
          title: "Chưa đăng ký được",
          text: errMsg,
          confirmButtonText: "Sửa thông tin",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Không kết nối được",
        text: "Máy chủ chưa phản hồi. Vui lòng thử lại sau ít phút.",
        confirmButtonText: "Đóng",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Đăng ký tài khoản bác sĩ"
      subtitle="Nhận lịch hẹn, trao đổi với chủ nuôi và phân công trợ lý ở cùng một nơi."
      photo="/assets/hero-2.webp"
      photoAlt="Chú chó đen quàng khăn xanh đang được xoa đầu"
      aside="Lịch làm việc gọn gàng, để bạn dành thời gian cho các bé nhiều hơn."
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
            <label htmlFor="vet-last">Họ</label>
            <input
              id="vet-last"
              type="text"
              name="lastName"
              autoComplete="family-name"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
          <div className="field">
            <label htmlFor="vet-first">Tên</label>
            <input
              id="vet-first"
              type="text"
              name="firstName"
              autoComplete="given-name"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="vet-login">Tên đăng nhập</label>
          <input
            id="vet-login"
            type="text"
            name="login"
            autoComplete="username"
            value={formData.login}
            onChange={handleChange}
            required
            pattern="^[_.@A-Za-z0-9-]+$"
            title="Tên đăng nhập chỉ chứa chữ, số, dấu _ . @ -"
          />
          <span className="field-hint">Chỉ dùng chữ không dấu, số và các ký tự _ . @ -</span>
        </div>
        <div className="field">
          <label htmlFor="vet-email">Email</label>
          <input
            id="vet-email"
            type="email"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="vet-password">Mật khẩu</label>
          <input
            id="vet-password"
            type="password"
            name="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={4}
            maxLength={100}
          />
          <span className="field-hint">Từ 4 đến 100 ký tự.</span>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="vet-license">Số giấy phép hành nghề</label>
            <input
              id="vet-license"
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="vet-spec">Chuyên môn</label>
            <input
              id="vet-spec"
              type="text"
              name="specialization"
              placeholder="Ví dụ: Nội khoa"
              value={formData.specialization}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Đang đăng ký..." : "Đăng ký làm bác sĩ"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default RegisterVet;
