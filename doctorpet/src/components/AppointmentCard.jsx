import React from "react";
import "../css/AppointmentCard.css";
import {
  dateParts,
  statusLabel,
  typeLabel,
  locationLabel,
  LOCATION_ICONS,
} from "./appointmentLabels";

const PET_PLACEHOLDER = "/assets/pet-placeholder.svg";

// Thẻ lịch hẹn dùng chung cho chủ nuôi, bác sĩ và trợ lý
const AppointmentCard = ({
  pet,
  subtitle,
  timeStart,
  status,
  appointmentType,
  locationType,
  type,
  notes,
  actions,
}) => {
  const date = dateParts(timeStart);
  const isEmergency = appointmentType === "EMERGENCY";
  const petImage = pet?.imageUrl || pet?.image_url || PET_PLACEHOLDER;
  const showYear = date && date.year !== new Date().getFullYear();

  return (
    <article className={`appt-card ${isEmergency ? "is-emergency" : ""}`}>
      {date && (
        <div className="appt-date" aria-label={`${date.weekday}, ngày ${date.day} ${date.month} ${date.year}, lúc ${date.time}`}>
          <span className="appt-weekday">{date.weekday}</span>
          <span className="appt-day">{date.day}</span>
          <span className="appt-month">
            {date.month}
            {showYear && ` ${date.year}`}
          </span>
          <span className="appt-time">{date.time}</span>
        </div>
      )}

      <div className="appt-body">
        <div className="appt-top">
          <img
            className="appt-pet-avatar"
            src={petImage}
            alt=""
            onError={(e) => {
              if (!e.target.src.endsWith(PET_PLACEHOLDER)) e.target.src = PET_PLACEHOLDER;
            }}
          />
          <div className="appt-title">
            <h3>{pet?.name || `Thú cưng #${pet?.id ?? ""}`}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div className="appt-badges">
            {isEmergency && <span className="badge badge-EMERGENCY">Khẩn cấp</span>}
            {status && <span className={`badge badge-${status}`}>{statusLabel(status)}</span>}
          </div>
        </div>

        <ul className="appt-meta">
          {type && (
            <li>
              <i className="ri-stethoscope-line" aria-hidden="true"></i>
              {typeLabel(type)}
            </li>
          )}
          {locationType && (
            <li>
              <i className={LOCATION_ICONS[locationType] || "ri-map-pin-line"} aria-hidden="true"></i>
              {locationLabel(locationType)}
            </li>
          )}
        </ul>

        {notes && <p className="appt-notes">{notes}</p>}

        {actions && <div className="appt-actions">{actions}</div>}
      </div>
    </article>
  );
};

export default AppointmentCard;
