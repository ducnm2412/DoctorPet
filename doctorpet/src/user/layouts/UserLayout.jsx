import React, { useState, useEffect } from "react";
import "../../css/Dashboard.css";
import Header from "../../components/Header";
import ProfilePet from "../pages/ProfilePet";
import Appointment from "../pages/Appointment";
import Schedule from "../pages/Schedule";
import Question from "../pages/Question";
import Swal from "sweetalert2";
import ChatBox from "../../message/ChatBox";
import { API_URL } from "../../config";

// Các mục trong khu vực chủ nuôi
const PAGES = {
  profile: {
    label: "Hồ sơ thú cưng",
    icon: "ri-bear-smile-line",
    title: "Hồ sơ thú cưng",
    description: "Thông tin của từng bé, dùng cho mọi lần đặt lịch khám.",
  },
  appointment: {
    label: "Đặt lịch khám",
    icon: "ri-calendar-schedule-line",
    title: "Đặt lịch khám",
    description: "Chọn bé, bác sĩ và thời gian phù hợp. Bác sĩ sẽ duyệt lịch và nhắn tin cho bạn.",
  },
  schedule: {
    label: "Lịch đã đặt",
    icon: "ri-calendar-check-line",
    title: "Lịch đã đặt",
    description: "Theo dõi trạng thái lịch hẹn và nhắn tin với bác sĩ.",
  },
  question: {
    hidden: true,
    label: "Hỏi đáp",
    icon: "ri-question-answer-line",
    title: "Hỏi đáp",
    description: "Câu hỏi của bạn và phản hồi từ bác sĩ.",
  },
};

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
  const [showDetails, setShowDetails] = useState(false);
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

  if (loading)
    return (
      <>
        <Header />
        <p className="state-text page-state">Đang tải thông tin của bạn...</p>
      </>
    );
  if (error)
    return (
      <>
        <Header />
        <p className="state-text is-error page-state">
          Chưa tải được thông tin tài khoản ({error}). Hãy tải lại trang hoặc đăng nhập lại.
        </p>
      </>
    );
  const selectedAppointment = getSelectedAppointment();
  const displayName = userInfo.name || `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  const page = PAGES[active];
  return (
    <>
      <Header />
      <div className="dashboard-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className={`profile-card ${showDetails || isEditing ? "is-expanded" : ""}`}>
            <div className="profile-head">
              <img className="avatar" src="/assets/person-placeholder.svg" alt="" />
              <div>
                <p className="profile-name">{displayName || "Chủ nuôi"}</p>
                <p className="profile-role">Chủ nuôi</p>
                <button
                  type="button"
                  className="profile-toggle"
                  aria-expanded={showDetails}
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? "Thu gọn" : "Thông tin liên hệ"}
                  <i className={showDetails ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} aria-hidden="true"></i>
                </button>
              </div>
            </div>

            <button
              type="button"
              className="notification-icon"
              aria-label={`Thông báo tin nhắn${unreadCount > 0 ? `, ${unreadCount} chưa đọc` : ""}`}
              aria-expanded={showNotifications}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <i className="ri-notification-3-line" aria-hidden="true"></i>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {/* Dropdown thông báo */}
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h4>Tin nhắn từ bác sĩ</h4>
                  <button
                    className="notification-close"
                    aria-label="Đóng thông báo"
                    onClick={() => setShowNotifications(false)}
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
                <div className="notification-list">
                  {notifications.length === 0 ? (
                    <div className="notification-empty">
                      <i className="ri-message-3-line"></i>
                      <p>Chưa có tin nhắn nào. Tin nhắn từ bác sĩ sẽ hiện ở đây.</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        type="button"
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
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="profile-fields">
              <label className="profile-field">
                <span>Số điện thoại</span>
                <input
                  type="text"
                  placeholder={isEditing ? "Nhập số điện thoại" : "Chưa có"}
                  className="info-input"
                  value={userInfo.phone}
                  onChange={
                    isEditing
                      ? (e) => setUserInfo({ ...userInfo, phone: e.target.value })
                      : undefined
                  }
                  readOnly={!isEditing}
                />
              </label>
              <label className="profile-field">
                <span>Địa chỉ</span>
                <input
                  type="text"
                  placeholder={isEditing ? "Nhập địa chỉ" : "Chưa có"}
                  className="info-input"
                  value={userInfo.address}
                  onChange={
                    isEditing
                      ? (e) => setUserInfo({ ...userInfo, address: e.target.value })
                      : undefined
                  }
                  readOnly={!isEditing}
                />
              </label>
            </div>
            <button
              className={`btn ${isEditing ? "btn-primary" : "btn-quiet"} edit-profile-btn`}
              onClick={() => {
                // Khi nhấn Lưu (isEditing là true), gọi API update, sau đó chuyển sang chế độ Sửa
                if (isEditing) updateOwner();
                // Đảo ngược trạng thái isEditing
                setIsEditing(!isEditing);
              }}
            >
              {isEditing ? "Lưu thông tin" : "Sửa thông tin liên hệ"}
            </button>
          </div>

          <nav className="menu-section" aria-label="Mục">
            {Object.entries(PAGES).map(([key, item]) =>
              item.hidden ? null : (
                <button
                  key={key}
                  className={`menu-btn ${active === key ? "active" : ""}`}
                  aria-current={active === key ? "page" : undefined}
                  onClick={() => setActive(key)}
                >
                  <i className={item.icon} aria-hidden="true"></i>
                  {item.label}
                </button>
              )
            )}
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
        </main>
      </div>
    </>
  );
};

export default UserLayout;
