import React, { useState, useEffect } from "react";
import "../css/ScheduleItem.css";
import ButtonMessage from "../../message/ButtonMessage";
import ChatBox from "../../message/ChatBox";
import { API_URL } from "../../config";

const ScheduleItem = (props) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadMessageId, setLastReadMessageId] = useState(null);

  // Lấy thông tin user hiện tại từ localStorage
  const getCurrentUser = () => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        return {
          id: user.id,
          name: `${user.firstName} ${user.lastName}` || "Bạn",
        };
      } catch (e) {
        return null;
      }
    }
    return {
      id: null,
      name: "Bạn",
    };
  };

  const handleMessage = () => {
    setIsChatOpen(true);
    setIsChatMinimized(false);
  };

  // Lấy số tin nhắn chưa đọc
  useEffect(() => {
    if (!props.id) return;

    const fetchUnreadCount = async () => {
      try {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) return;

        const res = await fetch(
          `${API_URL}/api/appointments/${props.id}/messages`,
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        );

        if (!res.ok) return;
        const messages = await res.json();
        const messagesArray = Array.isArray(messages) ? messages : [];

        // Lấy currentUser trong useEffect
        const savedUser = localStorage.getItem("user");
        let currentUserId = null;
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            currentUserId = user.id;
          } catch (e) {
            return;
          }
        }

        if (!currentUserId) return;

        // Nếu ChatBox đang mở, cập nhật lastReadMessageId
        if (isChatOpen && messagesArray.length > 0) {
          const lastMessage = messagesArray[messagesArray.length - 1];
          setLastReadMessageId(lastMessage.id);
          setUnreadCount(0);
          return;
        }

        // Đếm tin nhắn chưa đọc: tin nhắn không phải của user hiện tại
        // và có id lớn hơn lastReadMessageId (tin nhắn mới sau lần đọc cuối)
        const unread = messagesArray.filter((m) => {
          if (m.senderId === currentUserId) return false;
          if (lastReadMessageId === null) return true; // Chưa đọc lần nào
          return m.id > lastReadMessageId; // Tin nhắn mới sau lần đọc cuối
        }).length;

        setUnreadCount(unread);
      } catch (err) {
        console.error("Lỗi khi lấy số tin nhắn chưa đọc:", err);
      }
    };

    fetchUnreadCount();
    // Polling mỗi 5 giây để cập nhật
    const interval = setInterval(fetchUnreadCount, 5000);
    return () => clearInterval(interval);
  }, [props.id, isChatOpen, lastReadMessageId]);

  const statusMap = {
    PENDING: "Chờ duyệt",
    APPROVED: "Đã duyệt",
    REJECTED: "Từ chối",
    RESCHEDULED: "Đổi lịch",
  };
  return (
    /*<div className={`history-item ${props.appointmentType === "EMERGENCY" ? "emergency-item" : ""}`}>
      <div className="history-time">
        {new Date(props.timeStart).toLocaleString("vi-VN")}
      </div>

      <div className="history-detail">
        <div className="column-1">
          <h3 className="name-pet">
            Thú cưng: {props.pet?.name || `ID: ${props.pet?.id}`}
          </h3>
          <p>Địa điểm: {props.locationType}</p>
          <p>Loại khám: {props.type}</p>
          <p>
            Loại lịch khám: 
            <span
              className={
                props.appointmentType === "EMERGENCY" ? "emergency" : ""
              }
            >
              {props.appointmentType}
            </span>
          </p>
        </div>
        <div className="column-2">
          <h3 className="name-vet">
            Bác sĩ: {props.vet?.name || `ID: ${props.vet?.id}`}
          </h3>
          <p>Ghi chú:{props.notes || "Không có"}</p>
        </div>
      </div>
      <div className="schedule-details">
        <button className="btn-schedule-details">Xem chi tiết</button>
      </div>
    </div>*/
    <>
      <div>
        <div className="appointment-card">
          <div className="card-header">
            <div className="pet-info">
              <img
                className="pet-avatar"
                src={props.pet.imageUrl || props.pet.image_url || "/assets/meme.jpg"}
                alt={props.pet.name || "pet"}
                onError={(e) => {
                  // Nếu ảnh lỗi, hiển thị ảnh mặc định
                  if (e.target.src !== "/assets/meme.jpg") {
                    e.target.src = "/assets/meme.jpg";
                  }
                }}
              />
              <div>
                <h3 className="pet-name">{props.pet.name}</h3>
                <p className="pet-vet">với {props.vet.name}</p>
              </div>
            </div>
            <div
              className={`appointmentType ${
                props.appointmentType === "EMERGENCY" ? "emergency" : ""
              } `}
            >
              <p>
                {props.appointmentType === "EMERGENCY"
                  ? "Khẩn Cấp"
                  : "Bình Thường"}
              </p>
            </div>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <i
                className="ri-calendar-line icon"
                style={{ color: "#2563eb" }}
              ></i>
              <p>
                <strong>Thời gian:</strong>
                {new Date(props.timeStart).toLocaleString("vi-VN")}
              </p>
            </div>

            <div className="info-item">
              <i
                className={`icon ${
                  props.locationType === "AT_HOME"
                    ? "ri-home-4-line"
                    : props.locationType === "AT_CLINIC"
                    ? "ri-hospital-line"
                    : ""
                }`}
              ></i>
              <span>
                <p>
                  <strong>Hình thức:</strong>{" "}
                  {props.locationType === "AT_HOME"
                    ? "Tại nhà"
                    : "Tại phòng khám"}
                </p>
              </span>
            </div>
            <div className={`type `}>
              <i
                className="ri-stethoscope-line"
                style={{ color: "#0ea5e9" }}
              ></i>
              <strong>Loại khám:</strong>{" "}
              {props.type === "SURGERY"
                ? "Phẫu thuật"
                : props.type === "VACCINE"
                ? "Chích Vaccine"
                : "Kiểm tra sức khỏe"}
            </div>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <i
                className="ri-file-text-line icon"
                style={{ color: "#6b7280" }}
              ></i>
              <span>
                <strong>Ghi chú:</strong> {props.notes}
              </span>
            </div>
            <div className="info-item">
              <span>
                <p>
                  <strong>Trạng thái:</strong>{" "}
                  {statusMap[props.status] || props.status}
                </p>
              </span>
            </div>
            <div className="info-item"></div>
          </div>

          <div className="detail-button-container">
            <ButtonMessage
              onClick={handleMessage}
              text="Nhắn tin"
              variant="primary"
              icon="ri-message-3-line"
              unreadCount={unreadCount}
            />
          </div>
        </div>
      </div>

      {/* ChatBox */}
      {isChatOpen && (
        <ChatBox
          appointmentId={props.id}
          currentUser={getCurrentUser()}
          recipientName={props.vet?.name || "Bác sĩ"}
          recipientAvatar={props.vet?.avatar}
          isOpen={isChatOpen}
          isMinimized={isChatMinimized}
          onClose={() => setIsChatOpen(false)}
          onMinimize={() => setIsChatMinimized(!isChatMinimized)}
        />
      )}
    </>
  );
};

export default ScheduleItem;
