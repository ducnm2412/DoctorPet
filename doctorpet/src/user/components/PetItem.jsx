import "../css/PetItem.css";
import Swal from "sweetalert2";

const PET_PLACEHOLDER = "/assets/pet-placeholder.svg";

// Tính tuổi dễ đọc từ ngày sinh
const ageFrom = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return null;
  const months =
    (new Date().getFullYear() - birth.getFullYear()) * 12 +
    (new Date().getMonth() - birth.getMonth());
  if (months < 1) return "Dưới 1 tháng tuổi";
  if (months < 12) return `${months} tháng tuổi`;
  return `${Math.floor(months / 12)} tuổi`;
};

const PetItem = (props) => {
  const handleViewOrEdit = () => {
    props.handleShowSidebarPetID(props.id);
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: `Xóa hồ sơ của ${props.name}?`,
      text: "Hồ sơ và thông tin sức khỏe của bé sẽ bị xóa khỏi tài khoản.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa hồ sơ",
      cancelButtonText: "Giữ lại",
      confirmButtonColor: "#9b3b34",
    });
    if (result.isConfirmed) props.handleDeletePet(props.id);
  };

  const description = [props.species, props.breed].filter(Boolean).join(", ");
  const age = ageFrom(props.dateOfBirth);

  return (
    <article className="pet-item">
      <div className="pet-item-head">
        <img
          className="pet-item-avatar"
          src={props.imageUrl || PET_PLACEHOLDER}
          alt=""
          onError={(e) => {
            if (!e.target.src.endsWith(PET_PLACEHOLDER)) e.target.src = PET_PLACEHOLDER;
          }}
        />
        <div>
          <h3>{props.name}</h3>
          {description && <p>{description}</p>}
        </div>
      </div>

      <dl className="pet-item-facts">
        <div>
          <dt>Tuổi</dt>
          <dd>{age || "Chưa rõ"}</dd>
        </div>
        <div>
          <dt>Cân nặng</dt>
          <dd>{props.weight ? `${props.weight} kg` : "Chưa có"}</dd>
        </div>
        <div className="is-wide">
          <dt>Dị ứng</dt>
          <dd>{props.allergies || "Không ghi nhận"}</dd>
        </div>
      </dl>

      <div className="pet-item-actions">
        <button className="btn btn-quiet pet-update" onClick={handleViewOrEdit}>
          Xem và sửa hồ sơ
        </button>
        <button
          className="pet-delete"
          onClick={handleDelete}
          aria-label={`Xóa hồ sơ của ${props.name}`}
          title="Xóa hồ sơ"
        >
          <i className="ri-delete-bin-6-line" aria-hidden="true"></i>
        </button>
      </div>
    </article>
  );
};

export default PetItem;
