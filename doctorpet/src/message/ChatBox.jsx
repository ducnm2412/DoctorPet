import React, { useState, useEffect, useRef } from "react";
import "remixicon/fonts/remixicon.css";
import "./css/ChatBox.css";
import { API_URL } from "../config";

const ChatBox = ({
  appointmentId,
  currentUser,
  recipientName,
  recipientAvatar,
  onClose,
  isOpen = true,
  onMinimize,
  isMinimized = false,
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Giới hạn độ dài tin nhắn (theo API: tối đa 1000 ký tự)
  const MAX_MESSAGE_LENGTH = 1000;

  // Hàm scroll xuống cuối mỗi khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Lấy danh sách tin nhắn (chỉ khi có appointmentId - chat với vet)
  // Nếu không có appointmentId, đây là chatbot công khai, không cần fetch lịch sử
  useEffect(() => {
    if (!isOpen || isMinimized) return;

    // Nếu không có appointmentId, đây là chatbot công khai - không cần fetch messages
    if (!appointmentId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/appointments/${appointmentId}/messages`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("jwt")}`,
            },
          }
        );
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Không thể tải tin nhắn");
        }
        const data = await res.json();
        // Đảm bảo data là array
        setMessages(Array.isArray(data) ? data : []);
        setError("");
      } catch (err) {
        console.error("Lỗi khi tải tin nhắn:", err);
        setError("Không thể tải tin nhắn. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Polling để cập nhật tin nhắn mới (mỗi 3 giây) - chỉ cho chat với vet
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [appointmentId, isOpen, isMinimized]);

  // Scroll xuống khi messages thay đổi
  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  // Gửi tin nhắn mới
  const sendMessage = async () => {
    const messageText = input.trim();

    // Validation
    if (!messageText) {
      setError("Tin nhắn không được để trống");
      return;
    }

    if (messageText.length > MAX_MESSAGE_LENGTH) {
      setError(`Tin nhắn không được vượt quá ${MAX_MESSAGE_LENGTH} ký tự`);
      return;
    }

    setSending(true);
    setError("");

    // Thêm tin nhắn của user vào danh sách ngay lập tức
    const userMessage = {
      id: Date.now(),
      message: messageText,
      senderId: currentUser?.id,
      senderName: currentUser?.name || "Bạn",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput(""); // Clear input ngay để UX tốt hơn

    try {
      let res;
      let data;

      // Nếu có appointmentId → chat với vet, không có → chatbot công khai
      if (appointmentId) {
        // Chat với vet về appointment (cần JWT)
        res = await fetch(
          `${API_URL}/api/appointments/${appointmentId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("jwt")}`,
            },
            body: JSON.stringify({ message: messageText }),
          }
        );

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Không thể gửi tin nhắn");
        }

        data = await res.json();
        // Response từ API chat với vet đã có đầy đủ thông tin message
        setMessages((prev) => [...prev, data]);
      } else {
        // Chatbot công khai (không cần JWT, ai cũng dùng được)
        res = await fetch(`${API_URL}/api/chat/public/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: messageText }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Không thể gửi tin nhắn");
        }

        data = await res.json();

        // Xử lý response từ chatbot
        // Lấy nội dung từ trường "response" nếu có, bỏ qua sessionId, createdDate
        let messageContent = "";

        if (typeof data === "string") {
          messageContent = data;
        } else if (data.response) {
          // Lấy nội dung từ trường "response"
          messageContent = data.response;
        } else if (data.message) {
          messageContent = data.message;
        } else if (data.content) {
          messageContent = data.content;
        } else {
          // Fallback: chỉ lấy các trường không phải metadata
          const { sessionId, createdDate, ...rest } = data;
          messageContent = JSON.stringify(rest);
        }

        // Loại bỏ các ký tự xuống dòng thừa và làm sạch nội dung
        messageContent = messageContent
          .replace(/\\n/g, "\n") // Chuyển \n thành xuống dòng thực sự
          .replace(/\n{3,}/g, "\n\n") // Giảm nhiều xuống dòng liên tiếp thành 2
          .trim();

        const botMessage = {
          id: Date.now() + 1,
          message: messageContent,
          senderId: "bot",
          senderName: "Chatbot",
          timestamp: new Date().toISOString(),
        };

        // Thêm phản hồi từ chatbot vào danh sách
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (err) {
      console.error("Lỗi khi gửi tin nhắn:", err);
      setError(err.message || "Không thể gửi tin nhắn. Vui lòng thử lại.");
      // Xóa tin nhắn user nếu gửi thất bại
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      setInput(messageText); // Khôi phục lại text nếu gửi thất bại
    } finally {
      setSending(false);
    }
  };

  // Xử lý Enter để gửi
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`chat-box-wrapper ${isMinimized ? "minimized" : ""}`}
      ref={chatContainerRef}
    >
      {/* Header */}
      <div className="chat-box-header">
        <div className="chat-box-header-info">
          {recipientAvatar && (
            <div className="chat-box-avatar">
              {typeof recipientAvatar === "string" ? (
                <img src={recipientAvatar} alt={recipientName} />
              ) : (
                <span>{recipientName?.charAt(0) || "U"}</span>
              )}
            </div>
          )}
          <div className="chat-box-header-text">
            <h4>{recipientName || "Người nhận"}</h4>
            <span className="chat-box-status">Đang hoạt động</span>
          </div>
        </div>
        <div className="chat-box-header-actions">
          {onMinimize && (
            <button
              className="chat-box-btn-icon"
              onClick={onMinimize}
              title={isMinimized ? "Mở rộng" : "Thu nhỏ"}
            >
              <i
                className={
                  isMinimized ? "ri-fullscreen-line" : "ri-subtract-line"
                }
              ></i>
            </button>
          )}
          {onClose && (
            <button
              className="chat-box-btn-icon"
              onClick={onClose}
              title="Đóng"
            >
              <i className="ri-close-line"></i>
            </button>
          )}
        </div>
      </div>

      {/* Messages Area - chỉ hiển thị khi không minimized */}
      {!isMinimized && (
        <>
          <div className="chat-box-messages">
            {loading && messages.length === 0 ? (
              <div className="chat-box-loading">
                <i className="ri-loader-4-line"></i>
                <span>Đang tải tin nhắn...</span>
              </div>
            ) : error && messages.length === 0 ? (
              <div className="chat-box-empty">
                <i className="ri-error-warning-line"></i>
                <p style={{ color: "#ef4444" }}>{error}</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="chat-box-empty">
                <i className="ri-message-3-line"></i>
                <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
              </div>
            ) : (
              messages.map((m) => {
                const isMyMessage = m.senderId === currentUser?.id;
                return (
                  <div
                    key={m.id}
                    className={`chat-box-message ${
                      isMyMessage ? "my-message" : "other-message"
                    }`}
                  >
                    {!isMyMessage && (
                      <div className="message-avatar">
                        {m.senderAvatar ? (
                          <img src={m.senderAvatar} alt={m.senderName} />
                        ) : (
                          <span>{m.senderName?.charAt(0) || "U"}</span>
                        )}
                      </div>
                    )}
                    <div className="message-content">
                      {!isMyMessage && (
                        <div className="message-sender">{m.senderName}</div>
                      )}
                      <div className="message-bubble">
                        <p>{m.message}</p>
                      </div>
                      <div className="message-time">
                        {new Date(m.timestamp).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-box-input-area">
            {error && messages.length > 0 && (
              <div
                className="chat-box-error"
                style={{
                  color: "#ef4444",
                  fontSize: "12px",
                  padding: "4px 12px",
                  marginBottom: "8px",
                }}
              >
                <i className="ri-error-warning-line"></i> {error}
              </div>
            )}
            <div className="chat-box-input-wrapper">
              <input
                type="text"
                value={input}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= MAX_MESSAGE_LENGTH) {
                    setInput(value);
                    setError(""); // Clear error khi user nhập
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder={`Nhập tin nhắn... (${input.length}/${MAX_MESSAGE_LENGTH})`}
                className="chat-box-input"
                maxLength={MAX_MESSAGE_LENGTH}
                disabled={sending}
              />
              <button
                className="chat-box-send-btn"
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                title={
                  input.length > MAX_MESSAGE_LENGTH * 0.9
                    ? `Còn ${MAX_MESSAGE_LENGTH - input.length} ký tự`
                    : ""
                }
              >
                {sending ? (
                  <i
                    className="ri-loader-4-line"
                    style={{ animation: "spin 1s linear infinite" }}
                  ></i>
                ) : (
                  <i className="ri-send-plane-fill"></i>
                )}
              </button>
            </div>
            {input.length > MAX_MESSAGE_LENGTH * 0.8 && (
              <div
                style={{
                  fontSize: "11px",
                  color:
                    input.length >= MAX_MESSAGE_LENGTH ? "#ef4444" : "#f59e0b",
                  padding: "4px 12px",
                  textAlign: "right",
                }}
              >
                {input.length}/{MAX_MESSAGE_LENGTH} ký tự
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBox;
