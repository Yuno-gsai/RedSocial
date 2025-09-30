import { useAmigosHandle } from "../../Handles/AmigosHandle";
import { useAuth } from "../../Auths/Useauth";
import { useEffect, useState } from "react";
import "/css/Amigos/AmigosRender.css";
import { AmigosSugeridos } from "./AmigosSujeridos";
import { BuscarAmigos } from "./BuscarAmigos";
import { useAuthHandlers } from "../../Handles/UserauthHandlers";
import { Solicitudes } from "./Solicitudes";

export const AmigosRender = () => {
  const { getAmigos, deleteAmigos } = useAmigosHandle(); 
  const { user } = useAuth(); 
  const [amigos, setAmigos] = useState([]); 
  const [usuariosList, setUsuariosList] = useState([]); 
  const [vista, setVista] = useState("amigos"); 
  const { getUser } = useAuthHandlers(); 

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const allUsers = await getUser();
        if (Array.isArray(allUsers)) {
          setUsuariosList(allUsers);
        } else {
          console.error("Datos de usuarios no válidos:", allUsers);
          setUsuariosList([]);
        }
      } catch (error) {
        console.error("Error cargando usuarios:", error);
        setUsuariosList([]);
      }
    };
    
    if (usuariosList.length === 0) {
      fetchUsuarios();
    }
  }, [getUser, usuariosList.length]);
  useEffect(() => {
    const fetchAmigos = async () => {
      try {
        const misAmigos = await getAmigos();
        if (Array.isArray(misAmigos)) {
          setAmigos(misAmigos);
        } else {
          console.error("Datos de amigos no válidos:", misAmigos);
          setAmigos([]);
        }
      } catch (error) {
        console.error("Error cargando amistades:", error);
        setAmigos([]);
      }
    };
    
    if (vista === "amigos") {
      fetchAmigos();
    }
  }, [getAmigos, vista]);

  const obtenerAmigo = (amistad) => {
    if (!user || !amistad) return null;

    try {
      if (amistad.usuario1_id === user.id) {
        return {
          id: amistad.usuario2_id,
          nombre: amistad.usuario2_nombre || 'Usuario sin nombre',
          foto: amistad.usuario2_foto,
          amistadId: amistad.amistad_id,
        };
      } else {
        return {
          id: amistad.usuario1_id,
          nombre: amistad.usuario1_nombre || 'Usuario sin nombre',
          foto: amistad.usuario1_foto,
          amistadId: amistad.amistad_id,
        };
      }
    } catch (error) {
      console.error("Error procesando datos del amigo:", error);
      return null;
    }
  };

  const handleEliminar = async (amistadId) => {
    if (!amistadId) {
      console.error("ID de amistad no válido");
      return;
    }
    
    if (!window.confirm("¿Seguro que quieres eliminar a este amigo?")) return;
    
    try {
      await deleteAmigos(amistadId);
      setAmigos(prevAmigos => 
        prevAmigos.filter(amigo => amigo.amistad_id !== amistadId)
      );
    } catch (error) {
      console.error("Error eliminando amistad:", error);
      alert("No se pudo eliminar al amigo. Inténtalo de nuevo más tarde.");
    }
  };

  return (
    <div className="amigos-contenedor">
      <h2 className="amigos-titulo">Mis Amigos</h2>

      <div className="amigos-botones">
        <button
          className={vista === "amigos" ? "btn-activo" : ""}
          onClick={() => setVista("amigos")}
        >
          Amigos
        </button>
        <button
          className={vista === "sugeridos" ? "btn-activo" : ""}
          onClick={() => setVista("sugeridos")}
        >
          Sugeridos
        </button>
        <button
          className={vista === "buscar" ? "btn-activo" : ""}
          onClick={() => setVista("buscar")}
        >
          Buscar
        </button>
        <button
          className={vista === "solicitudes" ? "btn-activo" : ""}
          onClick={() => setVista("solicitudes")}
        >
          Solicitudes
        </button>
      </div>

      {vista === "sugeridos" && (
        <div style={{ marginTop: 20, fontStyle: "italic", color: "#666" }}>
          <AmigosSugeridos />
        </div>
      )}

      {vista === "amigos" && (
        <div className="amigos-lista">
          {amigos.length === 0 ? (
            <p>No tienes amigos para mostrar.</p>
          ) : (
            amigos.map((amistad) => {
              const amigo = obtenerAmigo(amistad);
              if (!amigo) return null;

              const usuarioEncontrado = Array.isArray(usuariosList) 
                ? usuariosList.find(u => u && u.id === amigo.id)
                : null;
              const descripcionMostrada = usuarioEncontrado && usuarioEncontrado.biografia 
                ? usuarioEncontrado.biografia 
                : "Sin descripción disponible";

              return (
                <div key={amigo.id} className="amigo-casual-card">
                  <img
                    src={
                      amigo.foto
                        ? `${amigo.foto}`
                        : "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
                    }
                    alt={amigo.nombre}
                    className="amigo-foto-casual"
                  />
                  <div>
                    <span className="amigo-nombre-casual">
                      {amigo.nombre}
                    </span>
                    <p className="amigo-descripcion">
                      {descripcionMostrada}
                    </p>
                  </div>
                  <button
                    className="btn-eliminar"
                    onClick={() => handleEliminar(amigo.amistadId)}
                  >
                    X
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {vista === "buscar" && (
        <div style={{ marginTop: 20, fontStyle: "italic", color: "#666" }}>
          <BuscarAmigos />
        </div>
      )}
      {vista === "solicitudes" && (
        <div style={{ marginTop: 20, fontStyle: "italic", color: "#666" }}>
          <Solicitudes />
        </div>
      )}
    </div>
  );
};
