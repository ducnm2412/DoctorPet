import React from "react";
import "../css/SupItem.css";

const SupItem = ({ assistant, isSelected, onEdit, onDelete, onViewSchedule }) => {
  // Lấy assistantId: ưu tiên assistantId, nếu không có thì dùng id
  const assistantId =
    assistant.assistantId || assistant.assistant_id || assistant.id;
  const fullName = `${assistant.firstName || ""} ${assistant.lastName || ""}`.trim();
  const initials = (assistant.firstName || assistant.login || "?").charAt(0).toUpperCase();

  return (
    <article className={`sup-card ${isSelected ? "is-selected" : ""}`}>
      <span className="sup-avatar" aria-hidden="true">{initials}</span>
      <div className="sup-info">
        <h3>{fullName || assistant.login}</h3>
        <p>{assistant.email}</p>
      </div>

      <div className="sup-actions">
        {onViewSchedule && (
          <button
            className="btn btn-quiet btn-schedule"
            onClick={() => onViewSchedule(assistantId)}
          >
            <i className="ri-calendar-line" aria-hidden="true"></i>
            Xem lịch
          </button>
        )}
        <button className="btn btn-quiet btn-edit" onClick={() => onEdit(assistant)}>
          Sửa
        </button>
        <button
          className="btn-delete"
          onClick={() => onDelete(assistant.id)}
          aria-label={`Xóa trợ lý ${fullName}`}
          title="Xóa trợ lý"
        >
          <i className="ri-delete-bin-6-line" aria-hidden="true"></i>
        </button>
      </div>
    </article>
  );
};

export default SupItem;
