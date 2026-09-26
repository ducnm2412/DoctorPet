import React, { useState, useEffect } from "react";
import PetItem from "../components/PetItem";
import SiderbarPet from "../components/SiderbarPet";
import "../css/ProfilePet.css";
import { API_URL } from "../../config";

const ProfilePet = (props) => {
  const [pets, setPets] = useState([]);
  const [showSidebarPet, setShowSidebarPet] = useState(false);
  const [activePetItemId, setActivePetItemId] = useState(null);
// lấy token
  const jwt = localStorage.getItem("jwt"); 
  useEffect(() => {
    const fetchPets = async () => {
      if (!jwt) return; 

      try {
        const res = await fetch(
          `${API_URL}/api/pets`,
          {
            headers: { Authorization: `Bearer ${jwt}` },
          }
        );

        if (!res.ok) throw new Error("Không thể tải danh sách pet");
        const data = await res.json();
        setPets(data); 
      } catch (err) {
        console.error("Lỗi khi tải danh sách pet:", err);
      }
    };
    fetchPets();
  }, []);

  const handleShowSidebarPet = () => {
    setActivePetItemId(null);
    setShowSidebarPet(true);
  };

  const handleCancelPetForm = () => {
    setShowSidebarPet(false);
  };

  const handleShowSidebarPetID = (petId) => {
    setActivePetItemId(petId);
    setShowSidebarPet(true);
  };

  const activePetItem = pets.find((pet) => pet.id === activePetItemId);
  // Thêm mới hoặc cập nhật pet qua API
  const handleSavePet = async (data) => {
    // 
    const bodyData = { ...data, ownerId: props.ownerId };
    const url = activePetItemId
      ? `${API_URL}/api/pets/${activePetItemId}`
      : `${API_URL}/api/pets`;
    const method = activePetItemId ? "PUT" : "POST";
    if (activePetItemId) {
      bodyData.id = activePetItemId;
    }

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(bodyData), 
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage =
          errorData.message ||
          `Lỗi server (${res.status}): ${
            activePetItemId ? "Cập nhật" : "Thêm mới"
          } thất bại.`;
        throw new Error(errorMessage);
      }

      const savedPet = await res.json();

      if (activePetItemId) {
        setPets(pets.map((p) => (p.id === activePetItemId ? savedPet : p)));
      } else {
        setPets([...pets, savedPet]);
      }

      // Đóng form
      setShowSidebarPet(false);
      setActivePetItemId(null);
    } catch (err) {
      console.error("Lỗi API (Lưu):", err);
      throw err;
    }
  };

  const handleDeletePet = async (petId) => {
    try {
      const res = await fetch(`${API_URL}/api/pets/${petId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${jwt}` },
      });
      if (!res.ok) throw new Error("Xóa thất bại");
      setPets(pets.filter((p) => p.id !== petId));
      if (activePetItemId === petId) {
        setShowSidebarPet(false);
        setActivePetItemId(null);
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <>
      <div className="pet-grid">
        {pets.map((pet) => (
          <PetItem
            key={pet.id}
            {...pet}
            handleShowSidebarPetID={handleShowSidebarPetID}
            handleDeletePet={handleDeletePet}
          />
        ))}
        <button type="button" className="add-item" onClick={handleShowSidebarPet}>
          <span className="add-item-icon" aria-hidden="true">
            <i className="ri-add-line"></i>
          </span>
          <span className="add-item-title">Thêm thú cưng</span>
          <span className="add-item-text">
            {pets.length === 0
              ? "Tạo hồ sơ đầu tiên để bắt đầu đặt lịch khám."
              : "Mỗi bé một hồ sơ riêng."}
          </span>
        </button>
      </div>
      {showSidebarPet && (
        <SiderbarPet
          key={activePetItemId || "new"}
          petItem={activePetItem}
          handleCancelPetForm={handleCancelPetForm}
          handleSavePet={handleSavePet}
          ownerId = {props.ownerId}
        />
      )}
    </>
  );
};

export default ProfilePet;
