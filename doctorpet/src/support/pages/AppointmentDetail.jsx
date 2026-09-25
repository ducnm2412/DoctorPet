import React, { useEffect, useState } from "react";
import "remixicon/fonts/remixicon.css";
import "../css/AppointmentDetail.css";
import { useParams } from "react-router-dom";
import { API_URL } from "../../config";


const AppointmentDetail = () => {
    const { id } = useParams();
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const currentUser = JSON.parse(localStorage.getItem("user"));

    const fetchAppointment = async () => {
        const jwt = localStorage.getItem("jwt");
        if (!jwt) {
            alert("Không tìm thấy mã xác thực. Vui lòng đăng nhập lại.");
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/appointments/${id}`, {
                headers: { Authorization: `Bearer ${jwt}` }
            });

            const data = await res.json();
            setAppointment(data);
        } catch (err) {
            console.error("Lỗi fetch:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointment();
    }, [id]);


    if (loading) return <p>Đang tải dữ liệu...</p>;
    if (!appointment) return <p>Không tìm thấy lịch hẹn.</p>;

    return (
        <div className="detail-content">
            <div className="detail-card">
                <button className="back-btn" onClick={() => window.history.back()}>
                    <i className="ri-arrow-left-line"></i> Quay lại
                </button>
                <h2>Chi tiết lịch hẹn</h2>
                {/* Header */}
                <div className="row">
                    <p>
                        <strong>Trạng thái:</strong>{" "}
                        {appointment.status === "PENDING"
                            ? "Chờ duyệt"
                            : appointment.status === "APPROVED"
                                ? "Đã duyệt"
                                : appointment.status === "REJECTED"
                                    ? "Từ chối"
                                    : "Đổi lịch"}
                    </p>
                    <p>
                        <strong>Bắt đầu:</strong>{" "}
                        {new Date(appointment.timeStart).toLocaleString()}
                    </p>
                    <p>
                        <strong>Kết thúc:</strong>{" "}
                        {new Date(appointment.timeEnd).toLocaleString()}
                    </p>
                </div>
                <div className="row">
                    <p>
                        <strong>Loại lịch hẹn:</strong>{" "}
                        {appointment.type === "CHECKUP"
                            ? "Kiểm tra sức khỏe"
                            : appointment.type === "VACCINE"
                                ? "Tiêm chủng"
                                : "Phẫu thuật"}
                    </p>
                    <p>
                        <strong>Tình trạng:</strong>{" "}
                        {appointment.appointmentType === "EMERGENCY"
                            ? "Khẩn Cấp"
                            : "Bình Thường"}
                    </p>
                    <p>
                        <strong>Vị trí:</strong>{" "}
                        {appointment.locationType === "AT_HOME"
                            ? "Tại nhà"
                            : appointment.locationType === "AT_CLINIC"
                                ? "Tại phòng khám"
                                : ""}
                    </p>
                </div>
                <p>
                    <strong>Ghi chú:</strong> {appointment.notes || "Không có"}
                </p>
                {/* Thông tin Pet */}
                <div className="row">
                    {appointment.pet && (
                        <div>
                            <h3>Thông tin thú cưng</h3>
                            <div className="row">
                                <p>
                                    <strong>Tên:</strong> {appointment.pet.name}
                                </p>
                                <p>
                                    <strong>Loài:</strong> {appointment.pet.species}
                                </p>
                            </div>
                            <div className="row">
                                <p>
                                    <strong>Giống loài:</strong> {appointment.pet.breed}
                                </p>
                                <p>
                                    <strong>Giới tính:</strong> {appointment.pet.sex}
                                </p>
                            </div>
                            <div className="row">
                                <p>
                                    <strong>Ngày sinh:</strong> {appointment.pet.dateOfBirth}
                                </p>
                                <p>
                                    <strong>Cân nặng:</strong> {appointment.pet.weight} kg
                                </p>
                            </div>
                            <div className="row">
                                <p>
                                    <strong>Dị ứng:</strong>{" "}
                                    {appointment.pet.allergies || "Không có"}
                                </p>
                                <p>
                                    <strong>Ghi chú:</strong> {appointment.pet.notes || "Không có"}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Thông tin chủ nuôi */}
                    {appointment.owner && (
                        <div>
                            <h3>Thông tin chủ nuôi</h3>
                            <div className="row">
                                <p>
                                    <strong>Tên:</strong> {appointment.owner.name}
                                </p>
                                <p>
                                    <strong>Họ và tên:</strong> {appointment.owner.firstName}{" "}
                                    {appointment.owner.lastName}
                                </p>
                                <p>
                                    <strong>Số điện thoại:</strong> {appointment.owner.phone}
                                </p>
                                <p>
                                    <strong>Địa chỉ:</strong> {appointment.owner.address}
                                </p>
                            </div>
                        </div>
                    )}
                </div>


            </div>

        </div>
    );
};

export default AppointmentDetail;
