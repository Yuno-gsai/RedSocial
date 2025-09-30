import React, { useEffect, useState } from "react";
import { useAuthHandlers } from "../../Handles/UserauthHandlers";
import { Publicacion } from "../Publications/Publications";
import { LeftBar } from "../Home/LeftBar";
import "../../../css/Perfil/PerfilView.css";



export const FriendsPerfil = ({ userid, onClose }) => {
  const { getUserDataById } = useAuthHandlers();
  const [UserData, GetUserData] = useState(null);
  const [selectedNav, setSelectedNav] = useState("inicio");
  const [isLeftBarOpen, setIsLeftBarOpen] = useState(false);
  

  // Close sidebar when a navigation item is selected on mobile
  const handleNavSelect = (item) => {
    setSelectedNav(item);
    if (window.innerWidth <= 992) {
      setIsLeftBarOpen(false);
    }
  };



  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getUserDataById(userid);
        if (userData) {
          GetUserData(userData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    
    if (userid) {
      fetchData();
    }
  }, [userid, getUserDataById]);

  if (!UserData) {
    return <p>Cargando perfil...</p>;
  }

  return (
    <div className="main-layout">
      
      <div className={`left-sidebar`}>
        <LeftBar 
          selected={selectedNav} 
          onSelect={handleNavSelect}
          isOpen={isLeftBarOpen}
        />
      </div>
      
      <div className="profile-container" onClick={() => window.innerWidth <= 992 && isLeftBarOpen && setIsLeftBarOpen(false)} style={{ position: 'relative' }}>
        <button
          className="profile-close-btn"
          type="button"
          aria-label="Cerrar perfil"
          onClick={onClose}
          title="Cerrar perfil"
        >
          ×
        </button>
        <div className="profile-header">
          <img
            src={
              UserData.foto_perfil
                ? `${UserData.foto_perfil}`
                : "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
            }
            alt="Foto de perfil"
            className="profile-photo"
          />
          <div className="profile-info">
            <h2>{UserData.nombre_usuario}</h2>
            <p>{UserData.correo}</p>
            <p className="profile-meta">
              Miembro desde: {new Date(UserData.creado_en).toLocaleDateString()}
            </p>
            <div>
              {UserData.biografia || "Biografía no disponible"}
            </div>
          </div>
        </div>



        <h2 className="section-title">Publicaciones</h2>
        <Publicacion userID={userid} />
      </div>
    </div>
  );
};
