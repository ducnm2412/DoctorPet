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

  const handleViewDetail = () => {
    props.onDetail(props.id); // báo lên parent
  };

  // Lấy thông tin vet hiện tại
  const getCurrentUser = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (e) {
        return null;
      }
    }
    return {
      id: localStorage.getItem("vetId") || props.vetId,
      name: localStorage.getItem("vetName") || "Bác sĩ",
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
        const userData = localStorage.getItem("user");
        let currentUserId = null;
        if (userData) {
          try {
            const user = JSON.parse(userData);
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

        // Đếm tin nhắn chưa đọc: tin nhắn không phải của vet hiện tại
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

  return (
    <>
      <div>
        <div className="appointment-card">
          <div className="card-header">
            <div className="pet-info">
              <img className="pet-avatar" src="../public/assets/meme.jpg"
              alt="avatar"></img>
              <div>
                <h3 className="pet-name">{props.pet.name}</h3>
                <p className="pet-vet">với B.sĩ: {props.nameVet}</p>
              </div>
            </div>
            <div className="column">
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
              <button className="view-detail-btn" onClick={handleViewDetail}>
                Xem chi tiết
              </button>
            </div>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <i
                className="ri-calendar-line icon"
                style={{ color: "#2563eb" }}
              ></i>
              <span>
                <strong>Thời gian:</strong>{" "}
                {new Date(props.timeStart).toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
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
                <strong>Hình thức:</strong>{" "}
                {props.locationType === "AT_HOME"
                  ? "Tại nhà"
                  : props.locationType === "AT_CLINIC"
                  ? "Tại phòng khám"
                  : ""}
              </span>
            </div>
            <div className={`type `}>
              <i
                className="ri-stethoscope-line"
                style={{ color: "#0ea5e9" }}
              ></i>
              <strong> Loại khám: </strong> {""}
              {props.type === "CHECKUP"
                ? "Kiểm tra sức khỏe"
                : props.type === "VACCINE"
                ? "Tiêm chủng"
                : "Phẫu thuật"}
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
              <strong>Trạng thái:</strong>{" "}
              {props.status === "PENDING"
                ? "Chờ duyệt"
                : props.status === "APPROVED"
                ? "Đã duyệt"
                : props.status === "REJECTED"
                ? "Từ chối"
                : "Đổi lịch"}
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
          recipientName={props.pet?.ownerName || props.pet?.name || "Chủ nuôi"}
          recipientAvatar={props.pet?.ownerAvatar}
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
