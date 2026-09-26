import React from "react";
import Header from "../../components/Header";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import "../../css/Dashboard.css";

const SupportLayout = () => {
    return (
        <>
            <Header />
            <div className="dashboard-container">
                <Sidebar />
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </>
    );
};

export default SupportLayout;
