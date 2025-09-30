import "/css/Perfil/PerfilView.css";
import { Publicacion } from "../Publications/Publications";
import { NewPublication } from "../Publications/NewPublication";
import { useState } from "react";
import { useAuth } from "../../Auths/Useauth";

export const PerfilView = ({onEdit})=>{
  const [showNewPublication, setShowNewPublication] = useState(false);
    const onNewPublication = () => {
      setShowNewPublication(true);
    };
    const { user } = useAuth();
    return(
        <div className="profile-container">
        <div className="profile-header">
          <img
            src={
              user.foto_perfil
                ? `${user.foto_perfil}`
                : "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
            }
            alt="Foto de perfil"
            className="profile-photo"
          />
          <div className="profile-info">
            <h2>{user.nombre_usuario}</h2>
            <p>{user.correo}</p>
            <p className="profile-meta">Miembro desde: {new Date(user.creado_en).toLocaleDateString()}</p>
            <div >
              {user.biografia || "Biografia No Disponible"}
            </div>
          </div>
        </div>
        <div className="btn-group">
          <button className="buttonClass" onClick={onEdit}>Editar Perfil</button>
          <button className="buttonClass" onClick={onNewPublication}>Nueva Publicacion</button>
        </div>
        {showNewPublication ? <NewPublication onCancel={() => setShowNewPublication(false)} /> : 
        <Publicacion userID={user.id}/>
        }
      </div>
    )
}