import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import "../../css/Dashboard.css";

import VetSchedule from "../pages/VetSchedule";
import VetAppointment from "../pages/VetAppointment";
import VetProfileSup from "../pages/VetProfileSup";
import { API_URL } from "../../config";

// Các mục trong khu vực bác sĩ
const PAGES = {
  appointment: {
    label: "Lịch cần duyệt",
    icon: "ri-inbox-2-line",
    title: "Lịch cần duyệt",
    description: "Các yêu cầu khám mới đang chờ bạn duyệt, đổi lịch hoặc từ chối.",
  },
  schedule: {
    label: "Lịch làm việc",
    icon: "ri-calendar-2-line",
    title: "Lịch làm việc",
    description: "Những lịch hẹn bạn đã xử lý, xem theo ngày hoặc theo trạng thái.",
  },
  profile: {
    label: "Trợ lý của tôi",
    icon: "ri-team-line",
    title: "Trợ lý của tôi",
    description: "Tạo tài khoản cho trợ lý và xem lịch được phân công cho từng người.",
  },
};

const VetLayout = () => {
  const [active, setActive] = useState("appointment");
  const [showDetails, setShowDetails] = useState(false);

  // Thông tin bác sĩ thú y
  const [vetInfo, setVetInfo] = useState({
    id: "",
    user_id: "",
    name: "",
    specialization: "",
    license_no: "",
  });
  const savedUser = localStorage.getItem("user");
  const jwt = localStorage.getItem("jwt");
  // Lấy user hiện tại
  useEffect(() => {
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setVetInfo((prev) => ({
        ...prev,
        user_id: user.id,
        name: `${user.firstName} ${user.lastName}`,
      }));
    }
  }, [savedUser]);

  // Lấy danh sách tất cả vets
  const [vets, setVets] = useState([]);
  useEffect(() => {
    if (!jwt) return;

    fetch(`${API_URL}/api/vets`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setVets(data);
      })
      .catch((err) => console.error("Lỗi khi lấy danh sách vets:", err));
  }, [jwt]);

  // Tìm vet hiện tại theo user_id
  useEffect(() => {
    if (!vetInfo.user_id || vets.length === 0) return;

    const matchedVet = vets.find((vet) => vet.userId === vetInfo.user_id);

    if (matchedVet) {
      setVetInfo((prev) => ({
        ...prev,
        id: matchedVet.id,
        specialization: matchedVet.specialization || "",
        license_no: matchedVet.licenseNo || "",
      }));
    }
  }, [vetInfo.user_id, vets]);
  const page = PAGES[active];
  return (
    <>
      <Header />
      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className={`profile-card ${showDetails ? "is-expanded" : ""}`}>
            <div className="profile-head">
              <img className="avatar" src="/assets/doc1.webp" alt="" />
              <div>
                <p className="profile-name">{vetInfo.name || "Bác sĩ"}</p>
                <p className="profile-role">Bác sĩ thú y</p>
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
                <span>Chuyên môn</span>
                <p className="info-value">{vetInfo.specialization || "Chưa cập nhật"}</p>
              </div>
              <div className="profile-field">
                <span>Số giấy phép</span>
                <p className="info-value">{vetInfo.license_no || "Chưa cập nhật"}</p>
              </div>
            </div>
          </div>

          {/* Menu */}
          <nav className="menu-section" aria-label="Mục">
            {Object.entries(PAGES).map(([key, item]) => (
              <button
                key={key}
                className={`menu-btn ${active === key ? "active" : ""}`}
                aria-current={active === key ? "page" : undefined}
                onClick={() => setActive(key)}
              >
                <i className={item.icon} aria-hidden="true"></i>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="main-content">
          <div className="page-head">
            <div>
              <h1>{page.title}</h1>
              <p>{page.description}</p>
            </div>
          </div>
          {active === "appointment" && (
            <VetAppointment vetId={vetInfo.id} nameVet={vetInfo.name} />
          )}
          {active === "schedule" && (
            <VetSchedule vetId={vetInfo.id} nameVet={vetInfo.name} />
          )}
          {active === "profile" && (
            <VetProfileSup vetId={vetInfo.id} nameVet={vetInfo.name} />
          )}
        </main>
      </div>
    </>
  );
};

export default VetLayout;
