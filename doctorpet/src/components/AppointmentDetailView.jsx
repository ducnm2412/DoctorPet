import React from "react";
import "../css/AppointmentDetail.css";
import { formatDateTime, statusLabel, typeLabel, locationLabel } from "./appointmentLabels";

const Fact = ({ label, children }) => (
  <div className="detail-fact">
    <dt>{label}</dt>
    <dd>{children || <span className="muted">Chưa có</span>}</dd>
  </div>
);

// Chi tiết một lịch hẹn, dùng chung cho bác sĩ và trợ lý
const AppointmentDetailView = ({ appointment, onBack, actions }) => {
  const { pet, owner } = appointment;
  const isEmergency = appointment.appointmentType === "EMERGENCY";

  return (
    <div className="detail">
      <button className="back-link" onClick={onBack}>
        <i className="ri-arrow-left-line" aria-hidden="true"></i>
        Quay lại danh sách
      </button>

      <section className="detail-hero">
        <div className="detail-hero-head">
          <h2>Lịch khám của {pet?.name || "thú cưng"}</h2>
          <div className="detail-badges">
            {isEmergency && <span className="badge badge-EMERGENCY">Khẩn cấp</span>}
            <span className={`badge badge-${appointment.status}`}>
              {statusLabel(appointment.status)}
            </span>
          </div>
        </div>
        <dl className="detail-facts">
          <Fact label="Bắt đầu">{appointment.timeStart && formatDateTime(appointment.timeStart)}</Fact>
          <Fact label="Kết thúc">{appointment.timeEnd && formatDateTime(appointment.timeEnd)}</Fact>
          <Fact label="Loại khám">{appointment.type && typeLabel(appointment.type)}</Fact>
          <Fact label="Hình thức">{appointment.locationType && locationLabel(appointment.locationType)}</Fact>
        </dl>
        {appointment.notes && (
          <div className="detail-note">
            <h3>Ghi chú khi đặt lịch</h3>
            <p>{appointment.notes}</p>
          </div>
        )}
      </section>

      <div className="detail-grid">
        {pet && (
          <section className="detail-panel">
            <h3>
              <i className="ri-bear-smile-line" aria-hidden="true"></i>
              Thú cưng
            </h3>
            <dl>
              <Fact label="Tên">{pet.name}</Fact>
              <Fact label="Loài">{pet.species}</Fact>
              <Fact label="Giống">{pet.breed}</Fact>
              <Fact label="Giới tính">{pet.sex}</Fact>
              <Fact label="Ngày sinh">{pet.dateOfBirth}</Fact>
              <Fact label="Cân nặng">{pet.weight && `${pet.weight} kg`}</Fact>
              <Fact label="Dị ứng">{pet.allergies}</Fact>
              <Fact label="Ghi chú">{pet.notes}</Fact>
            </dl>
          </section>
        )}

        {owner && (
          <section className="detail-panel">
            <h3>
              <i className="ri-user-heart-line" aria-hidden="true"></i>
              Chủ nuôi
            </h3>
            <dl>
              <Fact label="Họ và tên">
                {[owner.firstName, owner.lastName].filter(Boolean).join(" ") || owner.name}
              </Fact>
              <Fact label="Số điện thoại">
                {owner.phone && <a href={`tel:${owner.phone.replace(/\s/g, "")}`}>{owner.phone}</a>}
              </Fact>
              <Fact label="Địa chỉ">{owner.address}</Fact>
            </dl>
          </section>
        )}
      </div>

      {actions && <div className="detail-actions">{actions}</div>}
    </div>
  );
};

export default AppointmentDetailView;
