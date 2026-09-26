import React, { useEffect, useState } from "react";
import "../css/Header.css";
import { Link, useLocation } from "react-router-dom";
import { getHomePathFor } from "./navigation";

const Header = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const homePath = getHomePathFor(user);
  const isOnDashboard = user && location.pathname.startsWith(homePath) && homePath !== "/";

  return (
    <header className="site-header">
      <Link to="/" className="site-header-logo" aria-label="DocPet - Trang chủ">
        <img src="/assets/logo.png" alt="DocPet" />
      </Link>

      <nav className="site-header-nav" aria-label="Tài khoản">
        {!user ? (
          <>
            <Link to="/register-vet/" className="site-header-link hide-sm">
              Dành cho bác sĩ
            </Link>
            <Link to="/login" className="btn btn-quiet">
              Đăng nhập
            </Link>
            <Link to="/register" className="btn btn-primary">
              Đăng ký
            </Link>
          </>
        ) : (
          <>
            <span className="site-header-greeting hide-sm">
              Xin chào, {user.firstName} {user.lastName}
            </span>
            {!isOnDashboard && (
              <Link to={homePath} className="btn btn-primary">
                Trang của tôi
              </Link>
            )}
            <button className="btn btn-quiet" onClick={handleLogout}>
              Đăng xuất
            </button>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
