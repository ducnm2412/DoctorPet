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
      title: "Đã gửi yêu cầu",
      text: "Bác sĩ sẽ xem và duyệt lịch sớm. Theo dõi trạng thái trong mục Lịch đã đặt.",
    });
      } else if (res.status === 400) {
        Swal.fire({
      icon: "error",
      title: "Chưa đặt được lịch",
      text: "Kiểm tra lại thời gian và thông tin rồi gửi lại.",
    });
      } else if (res.status === 401) {
        Swal.fire({
      icon: "warning",
      title: "Phiên đăng nhập đã hết hạn",
      text: "Hãy đăng nhập lại để tiếp tục đặt lịch.",
    });
      } else {
        Swal.fire({
      icon: "error",
      title: "Chưa đặt được lịch",
      text: `Máy chủ báo lỗi ${res.status}. Vui lòng thử lại sau ít phút.`,
    });
      }
    } catch (error) {
      console.error(error);
      setMessage("Lỗi kết nối đến server!");
    }
  };

  // Không cho chọn thời điểm trong quá khứ
  const now = new Date();
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <form className="form-appointment" onSubmit={handleSubmit}>
      {isLoading ? (
        <p className="state-text">Đang tải danh sách thú cưng và bác sĩ...</p>
      ) : (
        <fieldset className="booking-section">
          <legend>Ai sẽ đi khám?</legend>
          <div className="booking-row">
            <div className="field">
              <label htmlFor="book-pet">Thú cưng</label>
              <select
                id="book-pet"
                name="petId"
                value={formData.petId}
                onChange={handleChange}
                required
                disabled={pets.length === 0}
              >
                {pets.length > 0 ? pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name}
                  </option>
                )) : <option value="">Chưa có thú cưng</option>}
              </select>
              {pets.length === 0 && (
                <span className="field-hint">Thêm hồ sơ ở mục Hồ sơ thú cưng trước khi đặt lịch.</span>
              )}
            </div>
            <div className="field">
              <label htmlFor="book-vet">Bác sĩ thú y</label>
              <select
                id="book-vet"
                name="vetId"
                value={formData.vetId}
                onChange={handleChange}
                required
                disabled={vets.length === 0}
              >
                {vets.length > 0 ? vets.map((vet) => (
                  <option key={vet.id} value={vet.id}>
                    {[vet.lastName, vet.firstName].filter(Boolean).join(" ") || vet.name}
                    {vet.specialization ? `, ${vet.specialization}` : ""}
                  </option>
                )) : <option value="">Chưa có bác sĩ</option>}
              </select>
            </div>
          </div>
        </fieldset>
      )}

      <fieldset className="booking-section">
        <legend>Khi nào và ở đâu?</legend>
        <div className="booking-row">
          <div className="field">
            <label htmlFor="book-time">Thời gian khám</label>
            <input
              id="book-time"
              type="datetime-local"
              name="timeStart"
              min={minDateTime}
              value={formData.timeStart}
              onChange={handleChange}
              required
            />
            <span className="field-hint">Mỗi lượt khám kéo dài khoảng 1 giờ.</span>
          </div>
          <div className="field">
            <span className="field-label" id="book-location-label">Địa điểm</span>
            <div className="choice-group" role="radiogroup" aria-labelledby="book-location-label">
              <label className={`choice ${formData.locationType === "AT_CLINIC" ? "is-selected" : ""}`}>
                <input
                  type="radio"
                  name="locationType"
                  value="AT_CLINIC"
                  checked={formData.locationType === "AT_CLINIC"}
                  onChange={handleChange}
                />
                <i className="ri-hospital-line" aria-hidden="true"></i>
                Tại phòng khám
              </label>
              <label className={`choice ${formData.locationType === "AT_HOME" ? "is-selected" : ""}`}>
                <input
                  type="radio"
                  name="locationType"
                  value="AT_HOME"
                  checked={formData.locationType === "AT_HOME"}
                  onChange={handleChange}
                />
                <i className="ri-home-4-line" aria-hidden="true"></i>
                Tại nhà
              </label>
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className="booking-section">
        <legend>Bé cần khám gì?</legend>
        <div className="booking-row">
          <div className="field">
            <label htmlFor="book-type">Loại khám</label>
            <select id="book-type" name="type" value={formData.type} onChange={handleChange}>
              <option value="CHECKUP">Kiểm tra sức khỏe</option>
              <option value="VACCINE">Tiêm phòng</option>
              <option value="SURGERY">Phẫu thuật</option>
            </select>
          </div>
          <div className="field">
            <span className="field-label" id="book-urgency-label">Mức độ</span>
            <div className="choice-group" role="radiogroup" aria-labelledby="book-urgency-label">
              <label className={`choice ${formData.appointmentType === "NORMAL" ? "is-selected" : ""}`}>
                <input
                  type="radio"
                  name="appointmentType"
                  value="NORMAL"
                  checked={formData.appointmentType === "NORMAL"}
                  onChange={handleChange}
                />
                Bình thường
              </label>
              <label className={`choice is-urgent ${formData.appointmentType === "EMERGENCY" ? "is-selected" : ""}`}>
                <input
                  type="radio"
                  name="appointmentType"
                  value="EMERGENCY"
                  checked={formData.appointmentType === "EMERGENCY"}
                  onChange={handleChange}
                />
                Khẩn cấp
              </label>
            </div>
          </div>
        </div>
        <div className="field">
          <label htmlFor="book-notes">Triệu chứng và ghi chú</label>
          <textarea
            id="book-notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            placeholder="Ví dụ: bỏ ăn từ hôm qua, nôn hai lần, vẫn uống nước bình thường."
          ></textarea>
        </div>
      </fieldset>

      {message && <p className="form-note is-error">{message}</p>}

      <div className="booking-submit">
        <button
          className="btn btn-primary btn-appointment"
          type="submit"
          disabled={isLoading || pets.length === 0 || vets.length === 0 || !formData.timeStart}
        >
          Gửi yêu cầu đặt lịch
        </button>
        <p className="field-hint">Bác sĩ sẽ duyệt lịch và nhắn tin cho bạn trong mục Lịch đã đặt.</p>
      </div>
    </form>
  );
};

export default Appointment;
