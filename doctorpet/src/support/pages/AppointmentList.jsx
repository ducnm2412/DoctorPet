import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppointmentCard from "../../components/AppointmentCard";
import { API_URL } from "../../config";
const AppointmentList = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <>
      <div className="page-head">
        <div>
          <h1>Lịch hẹn được giao</h1>
          <p>Các ca khám bác sĩ đã phân công cho bạn. Mở chi tiết để xem hồ sơ thú cưng và thông tin chủ nuôi.</p>
        </div>
      </div>
      {loading ? (
        <p className="state-text">Đang tải lịch hẹn...</p>
      ) : appointments.length === 0 ? (
        <p className="state-text">Chưa có lịch hẹn nào được giao cho bạn.</p>
      ) : (
        <div className="appt-list">
          {appointments.map((app) => (
            <AppointmentCard
              key={app.id}
              pet={app.pet}
              subtitle={`với BS. ${[app.vet?.lastName, app.vet?.firstName].filter(Boolean).join(" ") || app.vet?.name || ""}`}
              timeStart={app.timeStart}
              status={app.status}
              appointmentType={app.appointmentType}
              locationType={app.locationType}
              type={app.type}
              notes={app.notes}
              actions={
                <button className="btn btn-primary btn-detail" onClick={() => onDetailClick(app)}>
                  Xem chi tiết
                </button>
              }
            />
          ))}
        </div>
      )}
    </>
  );
};

export default AppointmentList;
