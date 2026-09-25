import React from "react";
import "../css/Register.css";
import { useState } from "react";
import { API_URL } from "../config";

const Register = () => {
  const [formData, setFormData] = useState({
    login: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    langKey: "vi",
    authorities: ["ROLE_OWNER"], 
  });
  
  const [message, setMessage] = useState("");
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const registrationBody = {
      login: formData.login,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      langKey: formData.langKey,
      authorities: formData.authorities,
    };

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationBody),
      });

      if (response.ok) {
        setMessage("Đăng ký thành công! Bạn có thể đăng nhập.");
        setFormData({
          login: "",
          password: "",
          firstName: "",
          lastName: "",
          email: "",
          langKey: "vi",
          authorities: ["ROLE_OWNER"], 
        });
      } else {
        let err = "Đăng ký thất bại!";
        try {
          const data = await response.json();
          if (data.message) err = data.message;
        } catch {err}
        setMessage(err);
      }
    } catch (error) {
      console.error(error);
      setMessage("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

    return (
     <div className="register-body">
       <div className="register-container">
         <h2>Đăng Ký Tài Khoản</h2>
         <form className="register-form" onSubmit={handleSubmit}>
           <div className="form-group">
             <label>Họ</label>
             <input
               type="text"
               name="firstName"
               value={formData.firstName}
               onChange={handleChange}
               placeholder="Nhập họ"
               required
             />
           </div>
           <div className="form-group">
             <label>Tên</label>
             <input
               type="text"
               name="lastName"
               value={formData.lastName}
               onChange={handleChange}
               placeholder="Nhập tên"
               required
             />
           </div>
           <div className="form-group">
             <label>Tên đăng nhập</label>
             <input
               type="text"
               name="login"
               value={formData.login}
               onChange={handleChange}
               placeholder="Nhập tên đăng nhập"
               required
             />
           </div>
           <div className="form-group">
             <label>Email</label>
             <input
               type="email"
               name="email"
               value={formData.email}
               onChange={handleChange}
               placeholder="Nhập email"
               required
             />
           </div>
           <div className="form-group">
             <label>Mật khẩu</label>
             <input
               type="password"
               name="password"
               value={formData.password}
               onChange={handleChange}
               placeholder="Nhập mật khẩu"
               required
             />
           </div>
           
           <button type="submit" className="btn-register">
             Đăng Ký
           </button>
           {message && (
             <p style={{ marginTop: "10px", color: "red" }}>{message}</p>
           )}
           <p className="login-link">
             Đã có tài khoản? <a href="/login">Đăng nhập</a>
           </p>
           <a href="/">Trở về trang chủ</a>
         </form>
       </div>
     </div>
   );
};

export default Register;