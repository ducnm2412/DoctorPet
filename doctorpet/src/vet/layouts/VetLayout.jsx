import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import "remixicon/fonts/remixicon.css";

import VetSchedule from "../pages/VetSchedule";
import VetAppointment from "../pages/VetAppointment";
import VetProfileSup from "../pages/VetProfileSup";
import { API_URL } from "../../config";

const VetLayout = () => {
  const [active, setActive] = useState("appointment");

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
  return (
    <>
      <Header />
      <div className="dashboard-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="profile-section">
            <img
              className="avatar"
              src="/assets/doc1.jpg" // đường dẫn public đúng
              alt="avatar"
            />

            <input
              type="text"
              className="info-input"
              value={vetInfo.name}
              readOnly
            />

            <input
              type="text"
              className="info-input"
              value={vetInfo.specialization}
              readOnly
            />

            <input
              type="text"
              className="info-input"
              value={vetInfo.license_no}
              readOnly
            />
          </div>

          {/* Menu */}
          <div className="menu-section">
            <button
              className={`menu-btn ${active === "appointment" ? "active" : ""}`}
              onClick={() => setActive("appointment")}
            >
              Lịch khám cần duyệt
            </button>

            <button
              className={`menu-btn ${active === "schedule" ? "active" : ""}`}
              onClick={() => setActive("schedule")}
            >
              Lịch làm việc
            </button>

            <button
              className={`menu-btn ${active === "profile" ? "active" : ""}`}
              onClick={() => setActive("profile")}
            >
              Tài khoản trợ lí
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="main-content">
          {active === "appointment" && (
            <VetAppointment vetId={vetInfo.id} nameVet={vetInfo.name} />
          )}
          {active === "schedule" && (
            <VetSchedule vetId={vetInfo.id} nameVet={vetInfo.name} />
          )}
          {active === "profile" && (
            <VetProfileSup vetId={vetInfo.id} nameVet={vetInfo.name} />
          )}
        </div>
      </div>
    </>
  );
};

export default VetLayout;
