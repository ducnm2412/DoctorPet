import { useEffect, useState } from "react";
import "../css/AppointmentList.css";
import { useNavigate } from "react-router-dom";
import {
  formatDateTime,
  getBadgeClass,
  getLocation,
} from "../components/appointmentFormatter";
import { API_URL } from "../../config";
const AppointmentList = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eye, setEye] = useState(null);

  // Giả lập fetch API thật
  const fetchAppointments = async () => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) {
      alert("Không tìm thấy mã xác thực. Vui lòng đăng nhập lại.");
      return;
    }
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/appointments`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log("Lịch hẹn đã fetch:", data);
      setAppointments(data); // data là mảng nhiều lịch
    } catch (err) {
      console.error("Lỗi fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const onDetailClick = (appointment) => {
    navigate(`appointment/${appointment.id}`);
  };

  return (
    <div className="main-content">
      <div className="content-wrapper">
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : appointments.length === 0 ? (
          <p>Không có lịch nào.</p>
        ) : (
          appointments.map((app) => (
            <div key={app.id} className="appointment-card">
              <div className="card-header">
                <div className="pet-info">
                  <img
                    className="pet-avatar"
                    src={
                      app.pet.imageUrl ||
                      app.pet.image_url ||
                      "/assets/meme.jpg"
                    }
                    alt={app.pet.name || "pet"}
                    onError={(e) => {
                      // Nếu ảnh lỗi, hiển thị ảnh mặc định
                      if (e.target.src !== "/assets/meme.jpg") {
                        e.target.src = "/assets/meme.jpg";
                      }
                    }}
                  />
                  <div>
                    <h3 className="pet-name">{app.pet.name}</h3>
                    <p className="pet-vet">
                      với BS: {app.vet.lastName + " " + app.vet.firstName}
                    </p>
                  </div>
                </div>
                <div
                  className={`appointmentType ${
                    app.appointmentType === "EMERGENCY" ? "emergency" : ""
                  }`}
                >
                  {app.appointmentType === "EMERGENCY"
                    ? "KHẨN CẤP"
                    : "Bình Thường"}
                </div>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <i
                    className="ri-calendar-line icon"
                    style={{ color: "#2563eb" }}
                  ></i>
                  <span>
                    <strong>Thời gian:</strong> {formatDateTime(app.timeStart)}
                  </span>
                </div>

                <div className="info-item">
                  <i
                    className={`icon ${
                      app.locationType === "AT_HOME"
                        ? "ri-home-4-line"
                        : app.locationType === "AT_CLINIC"
                        ? "ri-hospital-line"
                        : "ri-video-chat-line"
                    }`}
                  ></i>
                  <span>
                    <strong>Hình thức:</strong> {getLocation(app.locationType)}
                  </span>
                </div>

                <div className="type">
                  <i
                    className="ri-stethoscope-line"
                    style={{ color: "#0ea5e9" }}
                  ></i>
                  <strong> Loại khám: </strong> {""}
                  {app.type === "CHECKUP"
                    ? "Kiểm tra sức khỏe"
                    : app.type === "VACCINE"
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
                    <strong>Ghi chú:</strong> {app.notes || "Không có"}
                  </span>
                </div>
                <div className="info-item">
                  <i className="ri-time-line icon-info text-orange-600"></i>
                  <div>
                    <strong>Trạng thái:</strong>{" "}
                    {app.status === "PENDING"
                      ? "Chờ duyệt"
                      : app.status === "APPROVED"
                      ? "Đã duyệt"
                      : app.status === "REJECTED"
                      ? "Từ chối"
                      : "Đổi lịch"}
                  </div>
                </div>
                <div className="info-item"></div>
              </div>

              <div className="detail-button-container">
                <button
                  className="btn-detail"
                  onClick={() => onDetailClick(app)}
                  onMouseEnter={() => setEye(app.id)}
                  onMouseLeave={() => setEye(null)}
                >
                  <i
                    className={
                      eye === app.id ? "ri-eye-line" : "ri-eye-off-line"
                    }
                  ></i>
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AppointmentList;
