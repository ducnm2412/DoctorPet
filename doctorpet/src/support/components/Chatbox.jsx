import React, { useState, useEffect, useRef } from "react";
import "../css/Chatbox.css";
import { API_URL } from "../../config";

export default function ChatBox({ appointmentId, currentUser }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    // Hàm scroll xuống cuối mỗi khi có tin nhắn mới
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // 1. Lấy danh sách tin nhắn khi component mount hoặc appointmentId thay đổi
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await fetch(`${API_URL}/api/appointments/${appointmentId}/messages`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("jwt")}`
                    }
                });
                if (!res.ok) throw new Error("Failed to fetch messages");
                const data = await res.json();
                setMessages(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchMessages();
    }, [appointmentId]);

    // Scroll xuống khi messages thay đổi
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 2. Gửi tin nhắn mới
    const sendMessage = async () => {
        if (!input.trim()) return;

        try {
            const res = await fetch(`${API_URL}/api/appointments/${appointmentId}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("jwt")}`
                },
                body: JSON.stringify({ message: input })
            });
            if (!res.ok) throw new Error("Failed to send message");
            const data = await res.json();
            setMessages(prev => [...prev, data]);
            setInput("");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-messages">
                {messages.map(m => (
                    <div
                        key={m.id}
                        className={m.senderId === currentUser.id ? "msg my-msg" : "msg other-msg"}
                    >
                        <div className="sender">{m.senderName}</div>
                        <div className="bubble">{m.message}</div>
                        <div className="time">
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
                />
                <button onClick={sendMessage}>Gửi</button>
            </div>
        </div>
    );
}
