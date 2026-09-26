// Nhãn tiếng Việt dùng chung cho lịch hẹn

export const STATUS_LABELS = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
  RESCHEDULED: "Đã đổi lịch",
  SCHEDULED: "Đã xếp lịch",
  CONFIRMED: "Đã xác nhận",
  IN_PROGRESS: "Đang khám",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
};

export const TYPE_LABELS = {
  CHECKUP: "Kiểm tra sức khỏe",
  VACCINE: "Tiêm phòng",
  SURGERY: "Phẫu thuật",
};

export const LOCATION_LABELS = {
  AT_CLINIC: "Tại phòng khám",
  AT_HOME: "Tại nhà",
  ONLINE: "Tư vấn online",
};

export const LOCATION_ICONS = {
  AT_CLINIC: "ri-hospital-line",
  AT_HOME: "ri-home-4-line",
  ONLINE: "ri-video-chat-line",
};

export const statusLabel = (status) => STATUS_LABELS[status] || status;
export const typeLabel = (type) => TYPE_LABELS[type] || type;
export const locationLabel = (loc) => LOCATION_LABELS[loc] || loc;

// Tách ngày giờ để hiển thị trong ô lịch
export const dateParts = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return {
    day: d.getDate(),
    month: `Th${d.getMonth() + 1}`,
    year: d.getFullYear(),
    weekday: d.toLocaleDateString("vi-VN", { weekday: "short" }),
    time: d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
  };
};

export const formatDateTime = (value) =>
  new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
