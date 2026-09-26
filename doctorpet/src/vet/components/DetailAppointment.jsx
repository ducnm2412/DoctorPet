import React, { useEffect, useState } from "react";
import AppointmentDetailView from "../../components/AppointmentDetailView";
import Swal from "sweetalert2";
import ButtonMessage from "../../message/ButtonMessage";
import ChatBox from "../../message/ChatBox";
import { API_URL } from "../../config";

const DetailAppointment = ({ appointmentId, onBack, onApproved }) => {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadMessageId, setLastReadMessageId] = useState(null);

  const vetToken = localStorage.getItem("jwt");

  // LẤY CHI TIẾT LỊCH HẸN
  useEffect(() => {
    const fetchAppointment = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/vet/appointments/${appointmentId}/detail`,
          {
            headers: { Authorization: `Bearer ${vetToken}` },
          }
        );

        if (!res.ok) throw new Error("Không thể lấy chi tiết lịch hẹn");

        const data = await res.json();
        setAppointment(data);
        console.log("Chi tiết appointment:", data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId, vetToken]);

  // Hàm lấy số tin nhắn chưa đọc
  const fetchUnreadCount = async () => {
    if (!appointmentId) return;

    try {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) return;

      const res = await fetch(
        `${API_URL}/api/appointments/${appointmentId}/messages`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      if (!res.ok) return;
      const messages = await res.json();
      const messagesArray = Array.isArray(messages) ? messages : [];

      // Lấy currentUser
      const savedUser = localStorage.getItem("user");
      let currentUserId = null;
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          currentUserId = user.id;
        } catch {
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

  // Lấy số tin nhắn chưa đọc
  useEffect(() => {
    fetchUnreadCount();
    // Polling mỗi 5 giây để cập nhật
    const interval = setInterval(fetchUnreadCount, 5000);
    return () => clearInterval(interval);
  }, [appointmentId, isChatOpen, lastReadMessageId]);

  // API DUYỆT LỊCH
  const approveAppointment = async (assistantId, note) => {
    try {
      const res = await fetch(
        `${API_URL}/api/vet/appointments/${appointmentId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${vetToken}`,
          },
          body: JSON.stringify({
            notes: note || "",
            assistantId: assistantId || null,
          }),
        }
      );

      if (!res.ok) throw new Error("Duyệt lịch thất bại");

      const updated = await res.json();
      setAppointment(updated);
      onApproved?.(updated);

      Swal.fire("Thành công!", "Lịch hẹn đã được duyệt", "success");
    } catch (err) {
      Swal.fire("Lỗi!", err.message, "error");
    }
  };

  // DUYỆT LỊCH - UI
  const handleApprove = async () => {
    const ask = await Swal.fire({
      title: "Phân công trợ lý?",
      text: "Bạn có muốn chọn trợ lý hỗ trợ?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Có",
      cancelButtonText: "Không",
    });

    // Nếu không chọn phân công trợ lý
    if (!ask.isConfirmed) {
      await approveAppointment(null, ""); // approve mà không có trợ lý
      return;
    }

    try {
      // Lấy danh sách trợ lý
      const res = await fetch(`${API_URL}/api/vets/assistants`, {
        headers: { Authorization: `Bearer ${vetToken}` },
      });
      const assistants = await res.json();

      // Log để kiểm tra cấu trúc dữ liệu
      if (assistants.length > 0) {
        console.log("Cấu trúc assistant đầu tiên:", assistants[0]);
        console.log("Tất cả các fields:", Object.keys(assistants[0]));
      }

      // Tạo map để lưu assistantId
      // API có thể trả về id là userId, cần tìm field chứa assistantId
      const assistantMap = new Map();
      assistants.forEach((a) => {
        // Thử các field có thể chứa assistantId
        // Ưu tiên: assistantId > assistant_id > id (nếu id là assistantId)
        const assistantId = a.assistantId || a.assistant_id;

        // Nếu không có field assistantId riêng, có thể id chính là assistantId
        // Hoặc cần gọi API khác để lấy assistantId từ userId
        if (assistantId) {
          assistantMap.set(a.id.toString(), assistantId);
        } else {
          // Nếu không có field assistantId, giả định id chính là assistantId
          // (nhưng cần xác nhận với backend)
          assistantMap.set(a.id.toString(), a.id);
        }
      });

      const optionsHtml = assistants
        .map(
          (a) => `<option value="${a.id}">${a.firstName} ${a.lastName}</option>`
        )
        .join("");

      // Hiển thị Swal chọn trợ lý + ghi chú
      const { value: formData } = await Swal.fire({
        title: "Chọn trợ lý & ghi chú",
        html: `
        <select id="assistantSelect" class="swal2-select">${optionsHtml}</select>
        <textarea id="noteInput" class="swal2-textarea" placeholder="Ghi chú..."></textarea>
      `,
        focusConfirm: false,
        preConfirm: () => ({
          selectedUserId: document.getElementById("assistantSelect").value,
          note: document.getElementById("noteInput").value,
        }),
      });

      if (formData) {
        // Lấy assistantId từ map dựa trên userId được chọn
        const selectedUserId = formData.selectedUserId;
        const assistantId = assistantMap.get(selectedUserId);

        if (!assistantId) {
          Swal.fire("Lỗi!", "Không tìm thấy assistantId", "error");
          return;
        }

        console.log("Gửi lên:", { assistantId, note: formData.note });

        // Phân công assistant
        const assignRes = await fetch(
          `${API_URL}/api/vet/appointments/${appointmentId}/assign-assistant`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${vetToken}`,
            },
            body: JSON.stringify({
              assistantId: parseInt(assistantId),
              notes: formData.note || "",
            }),
          }
        );

        if (!assignRes.ok) {
          const errorText = await assignRes.text();
          throw new Error(errorText || "Phân công trợ lý thất bại");
        }

        // Sau khi phân công xong, approve appointment với assistantId
        await approveAppointment(parseInt(assistantId), formData.note || "");
      }
    } catch (err) {
      Swal.fire("Lỗi!", err.message, "error");
    }
  };

  // TỪ CHỐI
  const handleReject = async () => {
    const ask = await Swal.fire({
      title: "Đổi lịch mới?",
      text: "Bạn có muốn đề xuất thời gian mới không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có",
      cancelButtonText: "Không",
    });

    //
    if (!ask.isConfirmed) {
      const { value: reason } = await Swal.fire({
        title: "Nhập lý do từ chối",
        input: "textarea",
        inputPlaceholder: "Nhập lý do...",
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
      });

      if (!reason) return;

      try {
        const res = await fetch(
          `${API_URL}/api/vet/appointments/${appointmentId}/reject`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${vetToken}`,
            },
            body: JSON.stringify({ reason }),
          }
        );

        const updated = await res.json();
        setAppointment(updated);
        onApproved?.(updated);

        Swal.fire("Đã từ chối lịch!", "", "success");
      } catch (err) {
        Swal.fire("Lỗi!", err.message, "error");
      }

      return;
    }

    //
    const { value: newDate } = await Swal.fire({
      title: "Chọn ngày giờ mới",
      html: `<input type="datetime-local" id="dateInput" class="swal2-input">`,
      focusConfirm: false,
      preConfirm: () => document.getElementById("dateInput").value,
    });

    if (!newDate) {
      return Swal.fire("Thiếu thông tin!", "Bạn chưa chọn thời gian.", "error");
    }

    try {
      const res = await fetch(
        `${API_URL}/api/vet/appointments/${appointmentId}/reschedule`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${vetToken}`,
          },
          body: JSON.stringify({
            newTimeStart: new Date(newDate).toISOString(),
            notes: "Đổi lịch theo yêu cầu",
          }),
        }
      );

      const updated = await res.json();
      setAppointment(updated);
      onApproved?.(updated);

      Swal.fire("Đổi lịch thành công!", "", "success");
    } catch (err) {
      Swal.fire("Lỗi!", err.message, "error");
    }
  };
  // YÊU CẦU KHÁM TẠI NHÀ
  const handleRequestHomeVisit = async () => {
    const { value: formData } = await Swal.fire({
      title: "Yêu cầu khám tại nhà",
      html: `
        <textarea id="notesInput" class="swal2-textarea" placeholder="Ghi chú (tùy chọn)..."></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: "Xác nhận",
      cancelButtonText: "Hủy",
      focusConfirm: false,
      preConfirm: () => {
        const notes = document.getElementById("notesInput").value.trim();
        return notes || null;
      },
    });

    if (formData === undefined) return; // Người dùng hủy

    try {
      // Tạo request body theo format API yêu cầu
      // Có thể là: { "notes": "..." }, { "notes": null }, hoặc {}
      const requestBody = formData ? { notes: formData } : { notes: null };

      const res = await fetch(
        `${API_URL}/api/vet/appointments/${appointmentId}/request-home-visit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${vetToken}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Yêu cầu khám tại nhà thất bại");
      }

      const updated = await res.json();
      setAppointment(updated);
      onApproved?.(updated);

      // Refresh tin nhắn sau khi yêu cầu khám tại nhà thành công
      // (Backend tự động gửi tin nhắn thông báo)
      await fetchUnreadCount();

      Swal.fire("Thành công!", "Đã gửi yêu cầu khám tại nhà", "success");
    } catch (err) {
      Swal.fire("Lỗi!", err.message, "error");
    }
  };

  // UI
  if (loading) return <p className="state-text">Đang tải chi tiết lịch hẹn...</p>;
  if (error) return <p className="state-text is-error">{error}. Hãy quay lại danh sách và thử lần nữa.</p>;
  if (!appointment) return <p className="state-text">Không tìm thấy lịch hẹn này.</p>;

  const isPending = appointment.status === "PENDING";
  const isApproved = appointment.status === "APPROVED";
  const isNotHomeVisit = appointment.locationType !== "AT_HOME";

  // Lấy thông tin vet hiện tại
  const getCurrentUser = () => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        const fullName = `${user.firstName || ""} ${
          user.lastName || ""
        }`.trim();
        return {
          id: user.id,
          name: fullName || "Bác sĩ",
        };
      } catch {
        return null;
      }
    }
    return {
      id: null,
      name: "Bác sĩ",
    };
  };

  const handleMessage = () => {
    setIsChatOpen(true);
    setIsChatMinimized(false);
  };

  return (
    <>
      <AppointmentDetailView
        appointment={appointment}
        onBack={onBack}
        actions={
          <>
            <ButtonMessage
              onClick={handleMessage}
              text="Nhắn tin với chủ nuôi"
              variant="secondary"
              icon="ri-message-3-line"
              unreadCount={unreadCount}
            />
            <span className="spacer" />
            {/* Đơn đã duyệt nhưng chưa phải khám tại nhà */}
            {isApproved && isNotHomeVisit && (
              <button className="btn btn-quiet request-home-visit-btn" onClick={handleRequestHomeVisit}>
                <i className="ri-home-4-line" aria-hidden="true"></i>
                Đề nghị khám tại nhà
              </button>
            )}
            {isPending && (
              <>
                <button className="btn btn-danger reject" onClick={handleReject}>
                  Từ chối hoặc đổi lịch
                </button>
                <button className="btn btn-primary approve" onClick={handleApprove}>
                  Duyệt lịch
                </button>
              </>
            )}
          </>
        }
      />

      {/* ChatBox */}
      {isChatOpen && (
        <ChatBox
          appointmentId={appointmentId}
          currentUser={getCurrentUser()}
          recipientName={
            appointment.owner
              ? `${appointment.owner.firstName} ${appointment.owner.lastName}`
              : "Chủ nuôi"
          }
          recipientAvatar={appointment.owner?.avatar}
          isOpen={isChatOpen}
          isMinimized={isChatMinimized}
          onClose={() => setIsChatOpen(false)}
          onMinimize={() => setIsChatMinimized(!isChatMinimized)}
        />
      )}
    </>
  );
};

export default DetailAppointment;
