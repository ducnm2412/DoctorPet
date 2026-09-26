import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getHomePathFor, openChatbot } from "../components/navigation";
import "../css/Home.css";

const heroPhotos = [
  { src: "/assets/hero-1.webp", alt: "Một cô gái ôm chú chó golden và chú corgi trên giường" },
  { src: "/assets/hero-2.webp", alt: "Chú chó đen quàng khăn xanh đang được xoa đầu" },
  { src: "/assets/hero-3.webp", alt: "Chú mèo đen trắng chơi đùa trên trụ cào móng" },
];

const steps = [
  {
    title: "Tạo hồ sơ thú cưng",
    text: "Lưu tên, giống, cân nặng và tiền sử dị ứng để bác sĩ nắm trước tình trạng của bé.",
  },
  {
    title: "Chọn bác sĩ và giờ khám",
    text: "Khám tại phòng khám hoặc để bác sĩ đến nhà. Đánh dấu khẩn cấp nếu bé cần được xem sớm.",
  },
  {
    title: "Trò chuyện ngay trong lịch hẹn",
    text: "Nhắn tin với bác sĩ để hỏi thêm, gửi cập nhật và nhận dặn dò sau buổi khám.",
  },
];

const doctors = [
  { photo: "/assets/doc1.webp", name: "Bs. Ngô Minh Đức", role: "Bác sĩ trưởng, chuyên khoa nội tổng quát" },
  { photo: "/assets/doc3.webp", name: "Bs. Phạm Quốc Huy", role: "Chăm sóc da và dinh dưỡng thú cưng" },
  { photo: "/assets/doc2.webp", name: "Bs. Ngô Hoàng Thức", role: "Thú y di động, khám tại nhà" },
];

const Home = () => {
  const savedUser = localStorage.getItem("user");
  const bookingPath = savedUser ? getHomePathFor(JSON.parse(savedUser)) : "/register";

  return (
    <>
      <Header />
      <main className="home">
        {/* HERO */}
        <section className="hero">
          <div className="hero-text">
            <h1>
              Khám cho thú cưng,
              <br />
              nhẹ nhàng như ở nhà.
            </h1>
            <p className="hero-lead">
              Đặt lịch với bác sĩ thú y trong vài phút, khám tại phòng khám hoặc để bác sĩ
              đến tận nhà. Lịch hẹn, hồ sơ và tin nhắn đều nằm ở một chỗ.
            </p>
            <div className="hero-actions">
              <Link to={bookingPath} className="btn btn-primary btn-lg">
                Đặt lịch khám
              </Link>
              <button type="button" className="btn btn-quiet btn-lg" onClick={openChatbot}>
                <i className="ri-chat-smile-3-line" aria-hidden="true"></i>
                Hỏi trợ lý AI
              </button>
            </div>
            <p className="hero-note">
              Trợ lý AI trả lời các câu hỏi chăm sóc thường gặp, không cần đăng nhập.
            </p>
          </div>

          <div className="hero-visual">
            <div className="hero-arch">
              {heroPhotos.map((photo, index) => (
                <img
                  key={photo.src}
                  src={photo.src}
                  alt={photo.alt}
                  loading={index === 0 ? "eager" : "lazy"}
                  width="720"
                  height="900"
                />
              ))}
            </div>
          </div>
        </section>

        {/* CÁC BƯỚC */}
        <section className="steps" aria-labelledby="steps-title">
          <h2 id="steps-title">Ba bước để gặp bác sĩ</h2>
          <ol className="steps-list">
            {steps.map((step, index) => (
              <li key={step.title} className="step">
                <span className="step-number" aria-hidden="true">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* VỀ CHÚNG TÔI */}
        <section className="about" aria-labelledby="about-title">
          <div className="about-intro">
            <h2 id="about-title">Về DocPet</h2>
            <p>
              DocPet là nền tảng đặt lịch khám và chăm sóc thú cưng trực tuyến, giúp chủ nuôi
              tìm và đặt lịch với bác sĩ thú y đáng tin cậy mà không phải gọi điện hay xếp hàng.
            </p>
            <p>
              Chúng tôi tin rằng một buổi khám tốt bắt đầu từ trước khi bạn đến phòng khám:
              bác sĩ đã đọc hồ sơ, bạn biết rõ giờ hẹn, và mọi câu hỏi đều có người trả lời.
            </p>
          </div>
          <dl className="about-values">
            <div>
              <dt>Tầm nhìn</dt>
              <dd>
                Trở thành nơi chủ nuôi, bác sĩ và phòng khám thú y ở Việt Nam kết nối với nhau
                nhanh chóng và chuyên nghiệp.
              </dd>
            </div>
            <div>
              <dt>Sứ mệnh</dt>
              <dd>
                Mang lại sự tiện lợi và an tâm cho mỗi thú cưng và chủ nhân của chúng, bằng công
                nghệ gọn gàng và dịch vụ tận tâm.
              </dd>
            </div>
            <div>
              <dt>Điều chúng tôi giữ</dt>
              <dd>Tận tâm với thú cưng, minh bạch với chủ nuôi, và không ngừng cải tiến.</dd>
            </div>
          </dl>
        </section>

        {/* ĐỘI NGŨ */}
        <section className="team" aria-labelledby="team-title">
          <h2 id="team-title">Bác sĩ của chúng tôi</h2>
          <ul className="team-list">
            {doctors.map((doctor) => (
              <li key={doctor.name} className="team-member">
                <div className="team-photo">
                  <img src={doctor.photo} alt={doctor.name} loading="lazy" />
                </div>
                <h3>{doctor.name}</h3>
                <p>{doctor.role}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Home;
