import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showDetails, setShowDetails] = useState(false);
    const [user, setUserInfo] = useState({
        name: "",
        email: "",
    });

    useEffect(() => {
        // Lấy thông tin user từ localStorage
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            const user = JSON.parse(savedUser);
            setUserInfo({
                name: `${user.firstName} ${user.lastName}`,
                email: user.email || "",
            });
        }
    }, []);

    const isListPage = location.pathname.replace(/\/$/, "") === "/support";

    return (
        <aside className="sidebar">
            <div className={`profile-card ${showDetails ? "is-expanded" : ""}`}>
                <div className="profile-head">
                    <img className="avatar" src="/assets/person-placeholder.svg" alt="" />
                    <div>
                        <p className="profile-name">{user.name || "Trợ lý"}</p>
                        <p className="profile-role">Trợ lý bác sĩ</p>
                        <button
                            type="button"
                            className="profile-toggle"
                            aria-expanded={showDetails}
                            onClick={() => setShowDetails(!showDetails)}
                        >
                            {showDetails ? "Thu gọn" : "Xem hồ sơ"}
                            <i className={showDetails ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
                <div className="profile-fields">
                    <div className="profile-field">
                        <span>Email</span>
                        <p className="info-value">{user.email || "Chưa cập nhật"}</p>
                    </div>
                </div>
            </div>

            <nav className="menu-section" aria-label="Mục">
                <button
                    className={`menu-btn ${isListPage ? "active" : ""}`}
                    aria-current={isListPage ? "page" : undefined}
                    onClick={() => navigate("/support")}
                >
                    <i className="ri-list-check-3" aria-hidden="true"></i>
                    Lịch hẹn được giao
                </button>
            </nav>
        </aside>
    );
};

export default Sidebar;
