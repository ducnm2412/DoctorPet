import React from "react";
import { Link } from "react-router-dom";
import "../css/Auth.css";

// Khung chung cho các trang đăng nhập / đăng ký
const AuthLayout = ({ title, subtitle, photo, photoAlt, aside, children, footer }) => {
  return (
    <div className="auth-page">
      <aside className="auth-aside">
        <Link to="/" className="auth-logo" aria-label="DocPet - Trang chủ">
          <img src="/assets/logo.png" alt="DocPet" />
        </Link>
        <div className="auth-arch">
          <img src={photo} alt={photoAlt} />
        </div>
        <p className="auth-aside-text">{aside}</p>
      </aside>

      <main className="auth-main">
        <Link to="/" className="auth-logo auth-logo-mobile" aria-label="DocPet - Trang chủ">
          <img src="/assets/logo.png" alt="DocPet" />
        </Link>
        <div className="auth-panel">
          <h1>{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
          {children}
          {footer && <div className="auth-footer">{footer}</div>}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
