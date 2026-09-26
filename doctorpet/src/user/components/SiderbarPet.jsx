import React, { useState, useEffect } from "react";
import "../css/SidebarPet.css";

const SiderbarPet = (props) => {
  const pet = props.petItem;
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    sex: "",
    dateOfBirth: "",
    weight: "",
    allergies: "",
    notes: "",
    imageUrl: "",
    ownerId: props.ownerId,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (pet) {
      setFormData({
        name: pet.name || "",
        species: pet.species || "",
        breed: pet.breed || "",
        sex: pet.sex || "",
        dateOfBirth: pet.dateOfBirth || "",
        weight: pet.weight || "",
        allergies: pet.allergies || "",
        notes: pet.notes || "",
        imageUrl: pet.imageUrl || "",
        ownerId: props.ownerId,
      });
    } else {
      setFormData({
        name: "",
        species: "",
        breed: "",
        sex: "",
        dateOfBirth: "",
        weight: "",
        allergies: "",
        notes: "",
        imageUrl: "",
        ownerId: props.ownerId,
      });
    }
    setError("");
  }, [pet]);

  // xử lý input
  const handleChange = (e) => {
    // Nếu input là cân nặng, đảm bảo nó là số dương hoặc rỗng
    if (
      e.target.name === "weight" &&
      e.target.value !== "" &&
      Number(e.target.value) < 0
    ) {
      // Có thể thêm setError tại đây nếu muốn cảnh báo ngay lập tức
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Validation cơ bản (Đã có, giữ nguyên)
    if (
      !formData.name ||
      !formData.breed ||
      !formData.sex ||
      !formData.dateOfBirth
    ) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc (*)");
      return;
    }

    // 2. Cải tiến validation cho Cân nặng (Cho phép rỗng, nhưng phải là số dương nếu có)
    const weightValue = Number(formData.weight);
    if (formData.weight !== "" && (isNaN(weightValue) || weightValue <= 0)) {
      setError("Cân nặng phải là một số lớn hơn 0 (hoặc để trống)");
      return;
    }
    if (imageFile) {
      setFormData.imageUrl("image", imageFile); // đính kèm file
    }
    setLoading(true);
    try {
      // Gửi dữ liệu đi (chỉ gửi các trường cần thiết, tránh gửi các trường có thể gây lỗi nếu rỗng)
      await props.handleSavePet(formData);

      // *THÊM*: Sau khi lưu thành công, bạn có thể thông báo nhỏ hoặc tự động đóng form
    } catch (err) {
      console.error("Lỗi khi lưu:", err);
      // THAY ĐỔI: Sử dụng thông báo lỗi trả về từ ProfilePet nếu có
      setError(err.message || "Lỗi khi lưu dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    props.handleCancelPetForm();
  };
  const [imageFile, setImageFile] = useState(null);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
  };

  return (
    <div
      className="pet-sidebar"
      onMouseDown={(e) => {
        // bấm ra ngoài hộp thoại để đóng
        if (e.target === e.currentTarget && !loading) props.handleCancelPetForm();
      }}
    >
      <form
        className="pet-form"
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pet-form-title"
      >
        <div className="pet-form-head">
          <h3 id="pet-form-title">{pet ? `Hồ sơ của ${pet.name}` : "Thêm thú cưng"}</h3>
          <button
            type="button"
            className="pet-form-close"
            onClick={handleCancel}
            aria-label="Đóng"
            disabled={loading}
          >
            <i className="ri-close-line" aria-hidden="true"></i>
          </button>
        </div>

        {error && <p className="form-note is-error">{error}</p>}

        <div className="pet-form-row">
          <div className="field">
            <label htmlFor="pet-name">Tên thú cưng *</label>
            <input
              id="pet-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="pet-dob">Ngày sinh *</label>
            <input
              id="pet-dob"
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="pet-form-row">
          <div className="field">
            <label htmlFor="pet-species">Loài</label>
            <input
              id="pet-species"
              type="text"
              name="species"
              value={formData.species}
              onChange={handleChange}
              placeholder="Chó, mèo, thỏ..."
            />
          </div>
          <div className="field">
            <label htmlFor="pet-breed">Giống *</label>
            <input
              id="pet-breed"
              type="text"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              placeholder="Ví dụ: Corgi"
              required
            />
          </div>
        </div>

        <div className="pet-form-row">
          <div className="field">
            <label htmlFor="pet-sex">Giới tính *</label>
            <select
              id="pet-sex"
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              required
            >
              <option value="">Chọn giới tính</option>
              <option value="Đực">Đực</option>
              <option value="Cái">Cái</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="pet-weight">Cân nặng (kg)</label>
            <input
              id="pet-weight"
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              min="0"
              step="0.1"
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="pet-allergies">Dị ứng</label>
          <input
            id="pet-allergies"
            type="text"
            name="allergies"
            value={formData.allergies}
            onChange={handleChange}
            placeholder="Thức ăn, thuốc... nếu có"
          />
        </div>

        <div className="field">
          <label htmlFor="pet-notes">Ghi chú</label>
          <textarea
            id="pet-notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Tính cách, bệnh nền hoặc điều bác sĩ nên biết"
          ></textarea>
        </div>

        <div className="sb-footer">
          <button className="btn btn-quiet cancel-btn" type="button" onClick={handleCancel} disabled={loading}>
            Hủy
          </button>
          <button className="btn btn-primary save-btn" type="submit" disabled={loading}>
            {loading ? "Đang lưu..." : pet ? "Lưu thay đổi" : "Thêm thú cưng"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SiderbarPet;
