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

  return (
    <>
      <AppointmentCard
        pet={props.pet}
        subtitle={`với ${props.vet?.name || "bác sĩ"}`}
        timeStart={props.timeStart}
        status={props.status}
        appointmentType={props.appointmentType}
        locationType={props.locationType}
        type={props.type}
        notes={props.notes}
        actions={
          <ButtonMessage
            onClick={handleMessage}
            text="Nhắn tin với bác sĩ"
            variant={unreadCount > 0 ? "primary" : "secondary"}
            icon="ri-message-3-line"
            unreadCount={unreadCount}
          />
        }
      />

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
