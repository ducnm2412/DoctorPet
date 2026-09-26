import React, { useEffect, useState } from "react";
import AddSup from "../components/AddSup";
import SupItem from "../components/SupItem";
import "../css/VetProfileSup.css";
import Swal from "sweetalert2";
import { API_URL } from "../../config";
import { formatDateTime, statusLabel } from "../../components/appointmentLabels";
const VetProfileSup = () => {
  const [assistants, setAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingAssistant, setEditingAssistant] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedAssistantId, setSelectedAssistantId] = useState(null);
  const [assistantAppointments, setAssistantAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  const jwt = localStorage.getItem("jwt");

  const fetchAssistants = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/vets/assistants`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Không thể tải danh sách trợ lý");
      const text = await res.text();
      const data = text ? JSON.parse(text) : [];

      setAssistants(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssistants();
  }, []);

  const handleAddNew = () => {
    setEditingAssistant(null);
    setShowSidebar(true);
  };
  const handleEdit = (assistant) => {
    setEditingAssistant(assistant);
    setShowSidebar(true);
  };

const handleDelete = async (assistantId) => {
  const result = await Swal.fire({
    title: "Xóa trợ lý này?",
    text: "Trợ lý sẽ không đăng nhập được nữa và không còn nhận lịch mới.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Xóa trợ lý",
    cancelButtonText: "Giữ lại",
    confirmButtonColor: "#9b3b34",
  });

  // ❌ Người dùng bấm Hủy
  if (!result.isConfirmed) return;

  try {
    // ⏳ Hiện loading
    Swal.fire({
      title: "Đang xóa...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const res = await fetch(
      `${API_URL}/api/vets/assistants/${assistantId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    if (!res.ok) throw new Error("Xóa thất bại");

    // ✅ Cập nhật state
    setAssistants((prev) => prev.filter((a) => a.id !== assistantId));

    // 🎉 Thành công
    Swal.fire({
      icon: "success",
      title: "Đã xóa!",
      text: "Tài khoản trợ lý đã được xóa.",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Lỗi",
      text: err.message || "Có lỗi xảy ra",
    });
  }
};


  // Lấy lịch của assistant cụ thể
  const handleViewSchedule = async (assistantId) => {
    try {
      setLoadingAppointments(true);
      setSelectedAssistantId(assistantId);

      const res = await fetch(
        `${API_URL}/api/vets/assistants/${assistantId}/appointments`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Không thể tải lịch của trợ lý");

      const data = await res.json();
      setAssistantAppointments(data);
      console.log("Lịch của assistant:", data);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Chưa tải được lịch", text: err.message });
      setAssistantAppointments([]);
    } finally {
      setLoadingAppointments(false);
    }
  };


  // Khi form thêm/sửa lưu thành công → reload list
  const handleSaved = () => {
    setShowSidebar(false);
    setEditingAssistant(null);
    fetchAssistants();
  };

  const selectedAssistant = assistants.find(
    (a) => (a.assistantId || a.assistant_id || a.id) === selectedAssistantId
  );

  return (
    <div className="vet-profile-sup-container">
      <div className="assistants-toolbar">
        <p className="muted">
          {loading ? "Đang tải danh sách..." : `${assistants.length} trợ lý`}
        </p>
        <button className="btn btn-primary btn-add" onClick={handleAddNew}>
          <i className="ri-user-add-line" aria-hidden="true"></i>
          Thêm trợ lý
        </button>
      </div>

      {error && <p className="form-note is-error">{error}</p>}

      {/* Danh sách trợ lý */}
      <div className="assistant-list">
        {assistants.length === 0 && !loading && !error && (
          <p className="state-text">
            Bạn chưa có trợ lý nào. Tạo tài khoản để phân công trợ lý hỗ trợ các ca khám.
          </p>
        )}

        {assistants.map((a) => (
          <SupItem
            key={a.id}
            assistant={a}
            isSelected={(a.assistantId || a.assistant_id || a.id) === selectedAssistantId}
            onEdit={handleEdit}
            onDelete={() => handleDelete(a.id)}
            onViewSchedule={handleViewSchedule}
          />
        ))}
      </div>

      {/* Form thêm / sửa */}
      {showSidebar && (
        <AddSup
          assistant={editingAssistant}
          onCreated={handleSaved}
          onCancel={() => setShowSidebar(false)}
        />
      )}

      {/* Lịch của trợ lý được chọn */}
      {selectedAssistantId && (
        <section className="assistant-schedule-section" aria-live="polite">
          <div className="assistant-schedule-head">
            <h3>
              Lịch của{" "}
              {selectedAssistant
                ? `${selectedAssistant.firstName} ${selectedAssistant.lastName}`
                : "trợ lý"}
            </h3>
            <button
              className="btn btn-quiet"
              onClick={() => {
                setSelectedAssistantId(null);
                setAssistantAppointments([]);
              }}
            >
              Đóng
            </button>
          </div>

          {loadingAppointments ? (
            <p className="state-text">Đang tải lịch...</p>
          ) : assistantAppointments.length === 0 ? (
            <p className="state-text">Trợ lý này chưa được phân công lịch nào.</p>
          ) : (
            <ul className="assistant-schedule-list">
              {assistantAppointments.map((appt) => (
                <li key={appt.id}>
                  <span className="assistant-schedule-time">{formatDateTime(appt.timeStart)}</span>
                  <span className="assistant-schedule-pet">{appt.pet?.name}</span>
                  {appt.appointmentType === "EMERGENCY" && (
                    <span className="badge badge-EMERGENCY">Khẩn cấp</span>
                  )}
                  <span className={`badge badge-${appt.status}`}>{statusLabel(appt.status)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
};

export default VetProfileSup;
