import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppointmentDetailView from "../../components/AppointmentDetailView";
import { API_URL } from "../../config";


const AppointmentDetail = () => {
    const { id } = useParams();
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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


    if (loading) return <p className="state-text">Đang tải chi tiết lịch hẹn...</p>;
    if (!appointment) return <p className="state-text">Không tìm thấy lịch hẹn này.</p>;

    return (
        <AppointmentDetailView
            appointment={appointment}
            onBack={() => navigate("/support")}
        />
    );
};

export default AppointmentDetail;
