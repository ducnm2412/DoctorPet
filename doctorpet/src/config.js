// URL của backend API, cấu hình qua biến môi trường VITE_API_URL khi build
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");
