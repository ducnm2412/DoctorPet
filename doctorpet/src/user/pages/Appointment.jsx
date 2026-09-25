import React, { useState, useEffect } from "react";
import "../css/Appointment.css";
import Swal from 'sweetalert2'
import { API_URL } from "../../config";
const Appointment = ({ token }) => {
  const [formData, setFormData] = useState({
    timeStart: "",
    type: "CHECKUP",
    status: "PENDING",
    appointmentType: "NORMAL",
    locationType: "AT_CLINIC",
    notes: "",
    petId: "",
    vetId: "", 
  });

  const [message, setMessage] = useState("");
  const [pets, setPets] = useState([]); 
  const [vets, setVets] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
const jwt = localStorage.getItem("jwt");
  // lấy vet và pet
  useEffect(() => {
    const fetchDropdownData = async () => {
      if (!jwt) {
        setMessage("Lỗi: Bạn cần đăng nhập để xem danh sách.");
        setIsLoading(false);
        return;
      }
      
      const headers = {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      };

      try {
        const [petsRes, vetsRes] = await Promise.all([
          fetch(`${API_URL}/api/pets`, { headers }), 
          fetch(`${API_URL}/api/vets`, { headers }), 
        ]);

        let initialPetId = "";
        if (petsRes.ok) {
          const petsData = await petsRes.json();
          setPets(petsData);
          console.log("Danh sách Vet đã tải thành công:", petsData);
          if (petsData.length > 0) initialPetId = String(petsData[0].id);
        } else {
          console.error("Lỗi khi fetch Pets:", petsRes.status);
          setMessage(`Lỗi khi tải thú cưng: ${petsRes.status}`);
        }

        let initialVetId = "";
        if (vetsRes.ok) {
          const vetsData = await vetsRes.json();
          setVets(vetsData);
          console.log("Danh sách Vet đã tải thành công:", vetsData);
          if (vetsData.length > 0) initialVetId = String(vetsData[0].id);
        } else {
          console.error("Lỗi khi fetch Vets:", vetsRes.status);
          setMessage(`Lỗi khi tải bác sĩ: ${vetsRes.status}`);
        }
        
        setFormData(prev => ({ ...prev, petId: initialPetId, vetId: initialVetId }));

      } catch (error) {
        console.error("Lỗi kết nối khi lấy danh sách:", error);
        setMessage("Lỗi kết nối đến server khi tải danh sách!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDropdownData();
  }, [token]);
  // xử lý trên form
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // --- HANDLE SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading || !formData.petId || !formData.vetId) {
        setMessage("Vui lòng chọn đầy đủ Thú cưng và Bác sĩ.");
        return;
    }

    const payload = {
      timeStart: new Date(formData.timeStart).toISOString(),
      timeEnd: new Date(new Date(formData.timeStart).getTime() + 60 * 60 * 1000).toISOString(),
      status: "PENDING",
      appointmentType: formData.appointmentType,
      locationType: formData.locationType,
      type : formData.type,
      notes: formData.notes,
      pet: { id: Number(formData.petId) },
      vet: { id: Number(formData.vetId) },
    };
    
    // đặt lịch khám
    try {
      const res = await fetch(`${API_URL}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.status === 201) {
         Swal.fire({
      icon: "success",
      title: "Thành công",
      text: "Đặt lịch thành công!",
    });
      } else if (res.status === 400) {
        Swal.fire({
      icon: "error",
      title: "Thất bại",
      text: "Đặt lịch thất bại — kiểm tra dữ liệu đầu vào.",
    });
      } else if (res.status === 401) {
        Swal.fire({
      icon: "warning",
      title: "Chưa đăng nhập",
      text: "Bạn chưa đăng nhập hoặc token không hợp lệ.",
    });
      } else {
        Swal.fire({
      icon: "error",
      title: "Lỗi",
      text: `Đặt lịch thất bại, lỗi: ${res.status}`,
    });
      }
    } catch (error) {
      console.error(error);
      setMessage("Lỗi kết nối đến server!");
    }
  };

  return (
    <form className="form-appointment" onSubmit={handleSubmit}>
      <div className="row-1">
        <div className="column-1">
          <label>Thời gian khám:</label>
          <input
            type="datetime-local"
            name="timeStart"
            value={formData.timeStart}
            onChange={handleChange}
            required
          />
        </div>

        <div className="column-1">
          <label>Loại lịch khám:</label>
          <select
            name="appointmentType"
            value={formData.appointmentType}
            onChange={handleChange}
          >
            <option value="NORMAL">Bình thường</option>
            <option value="EMERGENCY">Khẩn cấp</option>
          </select>
        </div>
      </div>

      <label>Loại khám:</label>
      <select name="type" value={formData.type} onChange={handleChange}> 
        <option value="CHECKUP">Kiểm tra sức khỏe</option>
        <option value="VACCINE">Tiêm ngừa</option>
        <option value="SURGERY">Phẫu thuật</option>
      </select>

      <label>Địa điểm:</label>
      <select
        name="locationType"
        value={formData.locationType}
        onChange={handleChange}
      >
        <option value="AT_CLINIC">Tại phòng khám</option>
        <option value="AT_HOME">Tại nhà</option>
      </select>
      <label>Ghi chú:</label>
      <textarea
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        rows="4"
        placeholder="Nhập các triệu chứng, yêu cầu đặc biệt hoặc thông tin cần thiết khác..."></textarea>
      {/*  THAY THẾ INPUT BẰNG DROPDOWN VÀ XỬ LÝ TRẠNG THÁI TẢI */}
      {isLoading ? (
        <p style={{ marginTop: "15px", color: "#007bff" }}>Đang tải danh sách Thú cưng và Bác sĩ...</p>
      ) : (
        <div className="row-1">
          <div className="column-1">
            <label>Thú cưng:</label>
            <select
              name="petId"
              value={formData.petId}
              onChange={handleChange}
              required
              // Vô hiệu hóa nếu không có Pet nào
              disabled={pets.length === 0}
            >
              {pets.length > 0 ? pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name}
                </option>
              )) : <option value="" disabled>Không tìm thấy thú cưng</option>}
            </select>
          </div>
          <div className="column-1">
            <label>Bác sĩ thú y:</label>
            <select
              name="vetId"
              value={formData.vetId}
              onChange={handleChange}
              required
              // Vô hiệu hóa nếu không có Vet nào
              disabled={vets.length === 0}
            >
              {vets.length > 0 ? vets.map((vet) => (
                <option key={vet.id} value={vet.id}>
                  {vet.firstName} {vet.lastName} (ID: {vet.id})
                </option>
              )) : <option value="" disabled>Không tìm thấy bác sĩ thú y</option>}
            </select>
          </div>
        </div>
      )}

      <button 
        className="btn-appointment" 
        type="submit" 
        style={{ marginTop: "10px" }}
        // Vô hiệu hóa nút Đặt lịch khi đang tải hoặc không có Pet/Vet
        disabled={isLoading || pets.length === 0 || vets.length === 0 || !formData.timeStart}
      >
        Đặt lịch
      </button>

      {message && <p style={{ marginTop: "10px", color: "red" }}>{message}</p>}
    </form>
  );
};

export default Appointment;