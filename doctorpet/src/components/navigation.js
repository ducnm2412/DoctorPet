// Trang làm việc tương ứng với vai trò của tài khoản
export const getHomePathFor = (user) => {
  const authorities = user?.authorities || [];
  if (authorities.includes("ROLE_USER")) return "/user";
  if (authorities.includes("ROLE_DOCTOR")) return "/vet";
  if (authorities.includes("ROLE_ASSISTANT")) return "/support";
  return "/";
};

export const OPEN_CHATBOT_EVENT = "docpet:open-chatbot";

// Cho phép nơi khác (ví dụ nút ở trang chủ) mở chatbot
export const openChatbot = () => {
  window.dispatchEvent(new Event(OPEN_CHATBOT_EVENT));
};
