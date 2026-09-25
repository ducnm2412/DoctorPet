import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ContactButton from "./ContactButton";
import ChatBox from "../message/ChatBox";
import Swal from "sweetalert2";
import "remixicon/fonts/remixicon.css";
import { API_URL } from "../config";

const GlobalContactButton = () => {
  const location = useLocation();

  // Ẩn chatbot trên các trang: bác sĩ, login, đăng ký
  const hiddenPaths = ["/vet", "/login", "/register", "/register-vet"];
  if (hiddenPaths.some((path) => location.pathname.startsWith(path))) {
    return null;
  }
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [allAppointments, setAllAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Lấy thông tin user hiện tại
  const getCurrentUser = () => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        const fullName = `${user.firstName} ${user.lastName}`.trim();
        return {
          id: user.id,
          name: fullName || "Bạn",
        };
      } catch {
        return null;
      }
    }
    return {
      id: null,
      name: "Bạn",
    };
  };

  // Lấy danh sách appointments khi user đã đăng nhập
  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    const user = localStorage.getItem("user");

    if (!jwt || !user) {
      setAllAppointments([]);
      return;
    }

    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${API_URL}/api/appointments`, {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        const appointmentList = data.content || data;
        setAllAppointments(appointmentList);
      } catch (err) {
        console.error("Lỗi khi lấy appointments:", err);
      }
    };

    fetchAppointments();

    // Polling mỗi 10 giây để cập nhật danh sách appointments
    const interval = setInterval(fetchAppointments, 10000);
    return () => clearInterval(interval);
  }, []);

  // Lấy thông tin appointment được chọn
  useEffect(() => {
    if (!selectedAppointmentId) {
      setSelectedAppointment(null);
      return;
    }
    const appointment = allAppointments.find(
      (appt) => appt.id === selectedAppointmentId
    );
    setSelectedAppointment(appointment);
  }, [selectedAppointmentId, allAppointments]);

  // Xử lý khi click nút "Tư vấn"
  const handleContactClick = () => {
    // Luôn mở chatbot công khai trước (không cần đăng nhập, ai cũng dùng được)
    setSelectedAppointmentId(null); // null = chatbot công khai
    setIsChatOpen(true);
    setIsChatMinimized(false);
  };

  return (
    <>
      {/* Ẩn nút "Tư vấn" khi khung chat đang mở (kể cả khi thu nhỏ) */}
      {!isChatOpen && <ContactButton onClick={handleContactClick} />}

      {isChatOpen && (
        <ChatBox
          appointmentId={selectedAppointmentId} // null = chatbot công khai
          currentUser={getCurrentUser()}
          recipientName={
            selectedAppointmentId
              ? selectedAppointment?.vet?.fullName ||
                selectedAppointment?.vet?.name ||
                "Bác sĩ"
              : "Chatbot AI"
          }
          recipientAvatar={
            selectedAppointmentId ? selectedAppointment?.vet?.avatar : null
          }
          isOpen={isChatOpen}
          isMinimized={isChatMinimized}
          onClose={() => {
            setIsChatOpen(false);
            setSelectedAppointmentId(null);
          }}
          onMinimize={() => setIsChatMinimized(!isChatMinimized)}
        />
      )}
    </>
  );
};

export default GlobalContactButton;
