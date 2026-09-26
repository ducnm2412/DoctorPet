import React from "react";
import "./ContactButton.css";

const ContactButton = ({ onClick }) => {
  return (
    <button className="contact-button" onClick={onClick} aria-label="Hỏi trợ lý AI">
      <i className="ri-chat-smile-3-line" aria-hidden="true"></i>
      <span className="contact-button-text">Hỏi trợ lý</span>
    </button>
  );
};

export default ContactButton;
