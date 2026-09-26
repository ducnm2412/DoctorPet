import React, { useState, useEffect } from "react";
import AppointmentCard from "../../components/AppointmentCard";
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

  const petDescription = [props.pet?.species, props.pet?.breed].filter(Boolean).join(", ");

  return (
    <>
      <AppointmentCard
        pet={props.pet}
        subtitle={petDescription || "Thú cưng"}
        timeStart={props.timeStart}
        status={props.status}
        appointmentType={props.appointmentType}
        locationType={props.locationType}
        type={props.type}
        notes={props.notes}
        actions={
          <>
            <ButtonMessage
              onClick={handleMessage}
              text="Nhắn tin"
              variant={unreadCount > 0 ? "primary" : "secondary"}
              icon="ri-message-3-line"
              unreadCount={unreadCount}
            />
            <button className="btn btn-quiet view-detail-btn" onClick={handleViewDetail}>
              Xem chi tiết
            </button>
          </>
        }
      />

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
