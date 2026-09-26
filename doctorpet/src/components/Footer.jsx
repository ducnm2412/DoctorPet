import React from 'react'
import { Link } from 'react-router-dom'
import "../css/Footer.css";

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <img src="/assets/logo.png" alt="DocPet" />
          <p>Đặt lịch khám thú y, lưu hồ sơ thú cưng và trò chuyện với bác sĩ ở cùng một nơi.</p>
        </div>
        <nav className="site-footer-links" aria-label="Liên kết">
          <Link to="/register">Tạo tài khoản chủ nuôi</Link>
          <Link to="/register-vet/">Đăng ký làm bác sĩ</Link>
          <Link to="/login">Đăng nhập</Link>
        </nav>
      </div>
      <p className="site-footer-credit">© 2025 DocPet. Đồ án Công nghệ phần mềm của Nhóm 4.</p>
    </footer>
  )
}

export default Footer
