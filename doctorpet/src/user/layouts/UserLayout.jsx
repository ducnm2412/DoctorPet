import React, { useState, useEffect } from "react";
import "../css/UserLayout.css";
import Header from "../../components/Header";
import "remixicon/fonts/remixicon.css";
import ProfilePet from "../pages/ProfilePet";
import Appointment from "../pages/Appointment";
import Schedule from "../pages/Schedule";
import Question from "../pages/Question";
import Swal from "sweetalert2";
import ChatBox from "../../message/ChatBox";
import { API_URL } from "../../config";

const UserLayout = () => {
  const [active, setActive] = useState("profile");
  // State lưu thông tin user (owner)
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const savedUser = localStorage.getItem("user");
  const user = JSON.parse(savedUser);

  // State cho notification
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [allAppointments, setAllAppointments] = useState([]);
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const jwt = localStorage.getItem("jwt");
        const response = await fetch(`${API_URL}/api/owners`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Lỗi khi fetch: ${response.status}`);
        }
        const data = await response.json();
        setOwners(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOwners();
  }, []);
  const [userInfo, setUserInfo] = useState({
    name: "",
    address: "",
    phone: "",
    id: "",
    user_id: user.id,
  });
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    if (!user || owners.length === 0) return;

    const ownerMatches = owners.filter((owner) => owner.userId === user.id);
    if (ownerMatches.length === 0) return;

    const ownerId = ownerMatches[0].id;
    const fetchOwner = async () => {
      try {
        const jwt = localStorage.getItem("jwt");
        const response = await fetch(
          `${API_URL}/api/owners/${ownerId}`,
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
            credentials: "include",
          }
        );
        if (!response.ok) throw new Error("Failed to fetch owner info");
        const data = await response.json();

        setUserInfo({
          name: `${user.firstName} ${user.lastName}`,
          address: data.address || "",
          phone: data.phone || "",
          id: ownerId,
          user_id: user.id,
        });
      } catch (error) {
        console.error("Lỗi khi fetch thông tin owner:", error);
      }
    };

    fetchOwner();
  }, [owners, user?.id]);

  // Lấy thông tin user hiện tại
  const getCurrentUser = () => {
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log("Current User Data:", userData);
        const fullName = `${userData.firstName} ${userData.lastName}`.trim();
        return {
          id: userData.id,
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

  // Lấy danh sách appointments và kiểm tra tin nhắn mới
  useEffect(() => {
    if (!userInfo.id) return;

    const fetchNotifications = async () => {
      try {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) return;

        // Lấy danh sách appointments
        const appointmentsRes = await fetch(
          `${API_URL}/api/appointments`,
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        );

        if (!appointmentsRes.ok) return;
        const appointments = await appointmentsRes.json();
        const appointmentList = appointments.content || appointments;

        // Lưu danh sách appointments để dùng cho nút liên hệ
        setAllAppointments(appointmentList);

        // Lấy tin nhắn mới nhất cho mỗi appointment
        const notificationPromises = appointmentList.map(async (appt) => {
          try {
            const messagesRes = await fetch(
              `${API_URL}/api/appointments/${appt.id}/messages`,
              {
                headers: {
                  Authorization: `Bearer ${jwt}`,
                },
              }
            );

            if (!messagesRes.ok) return null;
            const messages = await messagesRes.json();
            const messagesArray = Array.isArray(messages) ? messages : [];

            if (messagesArray.length === 0) return null;

            // Lấy tin nhắn mới nhất
            const latestMessage = messagesArray[messagesArray.length - 1];
            const isUnread = latestMessage.senderId !== user.id;

            return {
              appointmentId: appt.id,
              appointment: appt,
              latestMessage: latestMessage,
              isUnread: isUnread,
              timestamp: latestMessage.timestamp,
            };
          } catch {
            return null;
          }
        });

        const notificationList = (await Promise.all(notificationPromises))
          .filter((n) => n !== null)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setNotifications(notificationList);
        setUnreadCount(notificationList.filter((n) => n.isUnread).length);
      } catch (err) {
        console.error("Lỗi khi lấy thông báo:", err);
      }
    };

    fetchNotifications();
    // Polling mỗi 5 giây để cập nhật thông báo
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [userInfo.id, user?.id]);

  // cập nhật người dùng
  const updateOwner = async () => {
    // 3. Lấy JWT để sử dụng trong header Authorization
    const jwt = localStorage.getItem("jwt");

    if (!jwt) {
      alert("Không tìm thấy mã xác thực. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/owners/${userInfo.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            // 4. Sử dụng JWT đã lấy để xác thực
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            name: userInfo.name,
            id: userInfo.id,
            phone: userInfo.phone,
            address: userInfo.address,
            user_id: userInfo.user_id,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update owner");
      const data = await response.json();
      Swal.fire({
        title: "Tốt lắm!",
        text: "Bạn đã cập nhật thành công!",
        icon: "success",
      });
      setUserInfo((prev) => ({
        ...prev,
        phone: data.phone,
        address: data.address,
      }));
    } catch (error) {
      console.error("Lỗi khi cập nhật owner:", error);
      Swal.fire({
        title: "Cập nhật thất bại!",
        text: error.message,
        icon: "error",
      });
    }
  };
  // Xử lý khi click nút "Liên hệ"
  const handleContactClick = () => {
    if (allAppointments.length > 0) {
      // Lấy appointment đầu tiên
      const firstAppointment = allAppointments[0];
      setSelectedAppointmentId(firstAppointment.id);
      setIsChatOpen(true);
      setIsChatMinimized(false);
    } else {
      // Nếu chưa có appointment, thông báo cho user
      Swal.fire({
        title: "Chưa có lịch hẹn",
        text: "Bạn cần đặt lịch hẹn trước khi có thể liên hệ với bác sĩ.",
        icon: "info",
        confirmButtonText: "Đặt lịch ngay",
        confirmButtonColor: "#ed8a43",
      }).then((result) => {
        if (result.isConfirmed) {
          setActive("appointment");
        }
      });
    }
  };

  // Lấy thông tin appointment được chọn
  const getSelectedAppointment = () => {
    if (!selectedAppointmentId) return null;
    return allAppointments.find((appt) => appt.id === selectedAppointmentId);
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p>Lỗi: {error}</p>;
  console.log("User Info:", userInfo);
  const selectedAppointment = getSelectedAppointment();
  return (
    <>
      <Header />
      <div className="dashboard-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="profile-section">
            <div
              className="notification-icon"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <i className="ri-notification-3-line"></i>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </div>

            {/* Dropdown thông báo */}
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h4>Thông báo tin nhắn</h4>
                  <button
                    className="notification-close"
                    onClick={() => setShowNotifications(false)}
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="notification-empty">
                      <i className="ri-message-3-line"></i>
                      <p>Chưa có tin nhắn nào</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.appointmentId}
                        className={`notification-item ${
                          notif.isUnread ? "unread" : ""
                        }`}
                        onClick={() => {
                          setSelectedAppointmentId(notif.appointmentId);
                          setIsChatOpen(true);
                          setIsChatMinimized(false);
                          setShowNotifications(false);
                        }}
                      >
                        <div className="notification-content">
                          <div className="notification-title">
                            {notif.appointment?.vet?.name || "Bác sĩ"}
                            {notif.isUnread && (
                              <span className="notification-dot"></span>
                            )}
                          </div>
                          <div className="notification-message">
                            {notif.latestMessage.message}
                          </div>
                          <div className="notification-time">
                            {new Date(notif.timestamp).toLocaleString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <img
              className="avatar"
              src="../public/assets/meme.jpg"
              alt="avatar"
            />
            <input
              type="text"
              placeholder="Tên người dùng"
              className="info-input"
              value={userInfo.name}
              readOnly
            />
            <input
              type="text"
              placeholder="Số điện thoại"
              className="info-input"
              value={userInfo.phone}
              onChange={
                isEditing
                  ? (e) => setUserInfo({ ...userInfo, phone: e.target.value })
                  : undefined
              }
              readOnly={!isEditing}
            />
            <input
              type="text"
              placeholder="Địa chỉ"
              className="info-input"
              value={userInfo.address}
              onChange={
                isEditing
                  ? (e) => setUserInfo({ ...userInfo, address: e.target.value })
                  : undefined
              }
              readOnly={!isEditing}
            />
            <button
              className="edit-profile-btn"
              onClick={() => {
                // Khi nhấn Lưu (isEditing là true), gọi API update, sau đó chuyển sang chế độ Sửa
                if (isEditing) updateOwner();
                // Đảo ngược trạng thái isEditing
                setIsEditing(!isEditing);
              }}
            >
              {isEditing ? "Lưu" : "Sửa"}
            </button>
          </div>

          <div className="menu-section">
            <button
              className={`menu-btn ${active === "profile" ? "active" : ""}`}
              onClick={() => setActive("profile")}
            >
              Hồ sơ thú cưng
            </button>
            <button
              className={`menu-btn ${active === "appointment" ? "active" : ""}`}
              onClick={() => setActive("appointment")}
            >
              Đặt lịch khám
            </button>
            <button
              className={`menu-btn ${active === "schedule" ? "active" : ""}`}
              onClick={() => setActive("schedule")}
            >
              Lịch đã đặt
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="main-content">
          {isChatOpen && selectedAppointmentId && (
            <ChatBox
              appointmentId={selectedAppointmentId}
              currentUser={getCurrentUser()}
              recipientName={
                selectedAppointment?.vet?.fullName ||
                selectedAppointment?.vet?.name ||
                notifications.find(
                  (n) => n.appointmentId === selectedAppointmentId
                )?.appointment?.vet?.name ||
                "Bác sĩ"
              }
              recipientAvatar={
                selectedAppointment?.vet?.avatar ||
                notifications.find(
                  (n) => n.appointmentId === selectedAppointmentId
                )?.appointment?.vet?.avatar
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
          {active === "profile" && <ProfilePet ownerId={userInfo.id} />}
          {active === "appointment" && <Appointment ownerId={userInfo.id} />}
          {active === "schedule" && <Schedule ownerId={userInfo.id} />}
          {active === "question" && <Question ownerId={userInfo.id} />}
        </div>
      </div>
    </>
  );
};

export default UserLayout;
