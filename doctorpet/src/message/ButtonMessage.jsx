import React from "react";
import "./css/ButtonMessage.css";

const ButtonMessage = ({
  onClick,
  text = "Nhắn tin",
  variant = "primary",
  icon = "ri-message-3-line",
  disabled = false,
  className = "",
  unreadCount = 0,
}) => {
  return (
    <button
      className={`btn-message btn-message-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <i className={icon}></i>
      {text && <span>{text}</span>}
      {unreadCount > 0 && (
        <span className="btn-message-badge">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
};

export default ButtonMessage;
