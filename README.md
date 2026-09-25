# DoctorPet - Veterinary Hospital Management System & AI Health Consultation

**DoctorPet** là hệ thống quản lý bệnh viện thú y toàn diện kết hợp trợ lý AI thông minh hỗ trợ chẩn đoán triệu chứng ban đầu cho thú cưng. Nền tảng phục vụ cho 4 nhóm người dùng chính: **Chủ thú cưng (Pet Owner)**, **Bác sĩ thú y (Veterinarian)**, **Trợ lý y tế (Assistant)** và **Quản trị viên (Admin)**.

---

## 🛠 Công nghệ sử dụng

### 1. Backend (`animal-hospital-springboot`)
* **Framework**: Java 17, Spring Boot 3.4.5
* **Security & Authentication**: Spring Security, OAuth2 Resource Server (JWT Token)
* **Database & ORM**: MySQL 8.0, Spring Data JPA, Hibernate
* **Mapping & Tools**: MapStruct 1.6.3, Lombok, Maven
* **API Documentation**: SpringDoc OpenAPI 2.8.8 (Swagger UI)
* **AI Integration**: Integration với Google Gemini API (Model `gemini-2.0-flash-001`) theo kiến trúc **RAG (Retrieval-Augmented Generation)** kết hợp cơ sở dữ liệu kiến thức thú y tự phát triển.

### 2. Frontend (`doctorpet`)
* **Framework**: React 19, Vite 7
* **Routing**: React Router DOM v7
* **UI & UX**: Vanilla CSS, Remixicon 4.7, SweetAlert2

---

## ✨ Tính năng chính

### 👥 1. Quản lý Tài khoản & Phân quyền (Authentication & Authorization)
* Đăng ký/Đăng nhập dành cho Chủ thú cưng (Owner) và Bác sĩ thú y (Vet).
* Phân quyền chi tiết theo Role: `ROLE_ADMIN`, `ROLE_DOCTOR`, `ROLE_ASSISTANT`, `ROLE_USER`.
* Bảo mật hệ thống bằng mã hóa password và JWT token.

### 🐾 2. Quản lý Hồ sơ Thú cưng (Pet Profile Management)
* Tạo và theo dõi hồ sơ thông tin thú cưng (Giống, Loài, Tuổi, Cân nặng, Tiền sử dị ứng, Ghi chú y tế).
* Lưu trữ và tra cứu lịch sử khám chữa bệnh của từng thú cưng.

### 📅 3. Đặt lịch & Quản lý Khám bệnh (Appointment Scheduling)
* Đặt lịch khám trực tuyến tại phòng khám (At Clinic) hoặc khám tại nhà (Home Visit).
* Quản lý trạng thái lịch hẹn linh hoạt: `PENDING`, `APPROVED`, `REJECTED`, `SCHEDULED`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `RESCHEDULED`.
* Hệ thống nhắn tin trực tiếp giữa chủ thú cưng và bác sĩ trong từng lịch hẹn.

### 🔬 4. Quy trình Y tế & Phối hợp Bác sĩ - Trợ lý (Vet Workflow & Support)
* **Hành động khám bệnh (Appointment Action)**: Bác sĩ ghi nhận chỉ định, diễn biến y tế và phân công công việc.
* **Xét nghiệm y tế (Lab Test)**: Yêu cầu xét nghiệm, cập nhật kết quả và quy trình xử lý mẫu xét nghiệm.
* **Phân công trợ lý (Assistant Assignment)**: Gán trợ lý y tế đồng hành hỗ trợ bác sĩ trong từng ca khám.

### 🤖 5. Trợ lý AI Chẩn đoán & Tư vấn Sức khỏe Thú cưng (RAG AI Chatbot)
* Tích hợp kiến trúc **RAG (Retrieval-Augmented Generation)**:
  * Cơ sở dữ liệu triệu chứng bệnh (120+ triệu chứng phổ biến cho Chó và Mèo).
  * Chuẩn hóa từ khóa tiếng Việt & thuật toán tính điểm độ liên quan (Relevance Scoring).
  * Bổ sung context từ Database vào Prompt trước khi gửi tới Google Gemini API.
* **Cơ chế Fallback thông minh**: Tự động phản hồi dựa trên kiến thức chuẩn y khoa từ Database khi không có kết nối AI bên ngoài.

---

## 📁 Cấu trúc Dự án

```text
doan_cnpm/
├── animal-hospital-springboot/    # Backend Spring Boot API
│   ├── src/main/java/com/docpet/animalhospital/
│   │   ├── domain/                # JPA Entities (User, Owner, Vet, Pet, Appointment, LabTest...)
│   │   ├── repository/            # JPA Repositories
│   │   ├── service/               # Business Logic & AI Services (ChatService, GeminiAIService...)
│   │   └── web/rest/              # RESTful Controllers
│   ├── src/main/resources/
│   │   └── application.yml        # Cấu hình Spring Boot & Database
│   └── pom.xml                    # File quản lý Maven dependencies
│
├── doctorpet/                     # Frontend React + Vite
│   ├── src/
│   │   ├── components/            # Shared UI Components (Header, Footer, ContactButton...)
│   │   ├── message/               # Chatbox & Message Components
│   │   ├── pages/                 # Home, Login, Register Pages
│   │   ├── user/                  # Giao diện dành cho Owner/Khách hàng
│   │   ├── vet/                   # Giao diện dành cho Bác sĩ thú y
│   │   └── support/               # Giao diện quản lý ca khám & xét nghiệm
│   └── package.json
│
└── sql.sql                        # Script khởi tạo Database MySQL
```

---

## 🚀 Hướng dẫn Khởi chạy Dự án

### Yêu cầu môi trường
* Java OpenJDK 17 trở lên
* Node.js 18+ & npm
* MySQL 8.0+

### 1. Khởi chạy Backend (Spring Boot)
```bash
cd animal-hospital-springboot

# 1. Tạo database MySQL tên 'animalhospital' và nạp dữ liệu từ file sql.sql
# 2. Mặc định kết nối MySQL localhost với root/1234; đổi qua biến môi trường DB_URL, DB_USERNAME, DB_PASSWORD nếu cần

# 3. Build và chạy Backend
mvn clean install
mvn spring-boot:run
```
Backend sẽ khởi chạy tại port: `http://localhost:8080` (Swagger UI: `http://localhost:8080/swagger-ui.html`)

### 2. Khởi chạy Frontend (React + Vite)
```bash
cd doctorpet

# Cài đặt thư viện
npm install

# Khởi chạy chế độ phát triển
npm run dev
```
Frontend sẽ chạy tại: `http://localhost:5173`

---

## ☁️ Deploy lên Web

Kiến trúc: **Vercel** (Frontend) → **Render** (Backend, Docker) → **MySQL** (Railway / Aiven).

### 1. Database
Tạo MySQL trên Railway hoặc Aiven, sau đó nạp dữ liệu: `mysql -h <host> -P <port> -u <user> -p <database> < sql.sql`

### 2. Backend (Render)
New → Web Service → chọn repo → Root Directory: `animal-hospital-springboot` → Runtime: **Docker** → Health Check Path: `/management/health`.

Dockerfile đã bật sẵn profile `prod` (`application-prod.yml`). Khai báo các biến môi trường:

| Biến | Bắt buộc | Ví dụ / Ghi chú |
| :--- | :---: | :--- |
| `DB_URL` | ✅ | `jdbc:mysql://<host>:<port>/<database>?useSSL=true&useUnicode=true&characterEncoding=utf8` |
| `DB_USERNAME` | ✅ | |
| `DB_PASSWORD` | ✅ | |
| `JWT_SECRET` | ✅ | Chuỗi Base64 ngẫu nhiên, tạo bằng `openssl rand -base64 32` |
| `CORS_ORIGINS` | ✅ | URL frontend, ví dụ `https://doctorpet.vercel.app` (nhiều URL phân tách bằng dấu phẩy) |
| `GEMINI_API_KEY` | | Chỉ cần khi bật AI |
| `AI_ENABLED` | | `true` để dùng Gemini, mặc định `false` (dùng dữ liệu trong DB) |

### 3. Frontend (Vercel)
Import repo → Root Directory: `doctorpet` → Framework: **Vite** → Environment Variable:
`VITE_API_URL=https://<backend>.onrender.com` (không có `/` ở cuối).

File `vercel.json` đã cấu hình để React Router hoạt động khi tải lại trang.

> Sau khi có URL frontend, nhớ cập nhật `CORS_ORIGINS` trên Render cho khớp.

---

## 📡 Các RESTful APIs chính

| Đơn vị | Phương thức | Endpoint | Mô tả |
| :--- | :--- | :--- | :--- |
| **Authentication** | `POST` | `/api/authenticate` | Đăng nhập hệ thống & cấp JWT Token |
| **Account** | `POST` | `/api/register` | Đăng ký tài khoản Chủ thú cưng |
| **Account** | `POST` | `/api/register-vet` | Đăng ký tài khoản Bác sĩ thú y |
| **Appointments** | `POST` | `/api/appointments` | Đặt lịch khám mới |
| **Appointments** | `GET` | `/api/appointments` | Lấy danh sách lịch hẹn |
| **Appointments** | `PATCH` | `/api/appointments/{id}/status` | Cập nhật trạng thái ca khám |
| **Vet Workflow** | `GET/POST`| `/api/vet-workflow/*` | Xử lý ca khám, xét nghiệm & chỉ định |
| **AI Chatbot** | `POST` | `/api/chat/public/messages` | Gửi câu hỏi tư vấn sức khỏe cho AI Chatbot |
