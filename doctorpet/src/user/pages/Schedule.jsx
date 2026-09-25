import React, { useState, useEffect } from "react";
import ScheduleItem from "../components/ScheduleItem";
import "../css/Schedule.css";
import { API_URL } from "../../config";

const Schedule = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL"); // trạng thái lọc

  const jwt = localStorage.getItem("jwt");

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!jwt) {
        setError("Vui lòng đăng nhập để xem lịch hẹn.");
        setIsLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      };
      
      try {
        const response = await fetch(`${API_URL}/api/appointments`, {
          method: "GET",
          headers: headers,
        });

        if (response.ok) {
          const data = await response.json();
          const appointmentList = data.content || data; 
          setAppointments(appointmentList);
          setFilteredAppointments(appointmentList); // mặc định hiển thị tất cả
          setError(null);
          console.log("Appointments từ server:", appointmentList);
        } else if (response.status === 401) {
          setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        } else {
          const errorText = await response.text();
          setError(`Lỗi khi tải lịch hẹn: ${response.status} - ${errorText.substring(0, 100)}`);
          console.error("Phản hồi lỗi server:", errorText);
        }
      } catch (err) {
        console.error("Lỗi kết nối:", err);
        setError("Không thể kết nối đến máy chủ.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [jwt]);

  // Hàm lọc theo status
  const handleFilter = (status) => {
    setStatusFilter(status);

    if (status === "ALL") {
      setFilteredAppointments(appointments);
    } else {
      const filtered = appointments.filter(a => a.status === status);
      setFilteredAppointments(filtered);
    }
  };

  // -----------------------
  // Render
  // -----------------------
  if (isLoading) {
    return (
      <div className="schedule">
        <p style={{ color: "#007bff", marginTop: "20px" }}>Đang tải danh sách lịch hẹn...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="schedule">
        <p style={{ color: "red", marginTop: "20px" }}>❌ Lỗi: {error}</p>
      </div>
    );
  }

  return (
    <div className="schedule">
      {/* Nút lọc trạng thái */}
      <div className="filter-buttons" style={{ marginBottom: "15px" }}>
        <button
          className={statusFilter === "ALL" ? "active" : ""}
          onClick={() => handleFilter("ALL")}
        >
          Tất cả
        </button>
        <button
          className={statusFilter === "PENDING" ? "active" : ""}
          onClick={() => handleFilter("PENDING")}
        >
          Chờ duyệt
        </button>
        <button
          className={statusFilter === "APPROVED" ? "active" : ""}
          onClick={() => handleFilter("APPROVED")}
        >
          Đã duyệt
        </button>
        <button
          className={statusFilter === "REJECTED" ? "active" : ""}
          onClick={() => handleFilter("REJECTED")}
        >
          Từ chối
        </button>
        <button
          className={statusFilter === "RESCHEDULED" ? "active" : ""}
          onClick={() => handleFilter("RESCHEDULED")}
        >
          Đổi lịch
        </button>
      </div>

      {/* Danh sách lịch hẹn */}
      {filteredAppointments.length === 0 ? (
        <p style={{ color: "gray" }}>Không có lịch hẹn phù hợp.</p>
      ) : (
        filteredAppointments.map((item) => (
          <ScheduleItem key={item.id} {...item} />
        ))
      )}
    </div>
  );
};

export default Schedule;
