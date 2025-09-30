import { useAuth } from "../../Auths/Useauth";
import { useAuthHandlers } from "../../Handles/UserauthHandlers";
import { useEffect, useState } from "react";
import "/css/Amigos/AmigosRender.css";
import { useAmigosHandle } from "../../Handles/AmigosHandle";

export const AmigosSugeridos = () => {
  const { getUser } = useAuthHandlers();
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [amigos, setAmigos] = useState([]); 
  const { createSolicitud, getSolicitudes, deleteSolicitud, getAmigos } = useAmigosHandle();

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const usuariosData = await getUser();
        if (!Array.isArray(usuariosData)) {
          console.error("Datos de usuarios no válidos:", usuariosData);
          setUsuarios([]);
        } else {
          
          let amigosData = [];
          try {
            amigosData = await getAmigos();
            setAmigos(Array.isArray(amigosData) ? amigosData : []);
          } catch (amigosError) {
            console.error("Error cargando amigos:", amigosError);
            setAmigos([]);
          }

          const amigosIds = new Set(
            amigosData.map((a) => {
              if (a.usuario1_id === user?.id) return a.usuario2_id;
              else return a.usuario1_id;
            })
          );

          const ahora = new Date();
          const hace7Dias = new Date();
          hace7Dias.setDate(ahora.getDate() - 7);

          const filtrados = usuariosData.filter(
            (u) =>
              u &&
              u.id &&
              u.id !== user?.id && 
              !amigosIds.has(u.id) && 
              u.creado_en &&
              new Date(u.creado_en) >= hace7Dias
          );

          setUsuarios(filtrados);
        }

        try {
          const solicitudesData = await getSolicitudes();
          if (Array.isArray(solicitudesData)) {
            const pendientes = solicitudesData.filter(
              (s) => s && s.solicitante_id === user?.id && s.estado === "pendiente"
            );
            setSolicitudes(pendientes);
          } else {
            console.error("Datos de solicitudes no válidos:", solicitudesData);
            setSolicitudes([]);
          }
        } catch (solicitudError) {
          console.error("Error cargando solicitudes:", solicitudError);
          setSolicitudes([]);
        }
      } catch (error) {
        console.error("Error cargando datos de usuarios:", error);
        setUsuarios([]);
        setSolicitudes([]);
        setAmigos([]);
      }
    };

    fetchDatos();
  }, [getUser, getSolicitudes, getAmigos, user]);

  const handleAgregarAmigo = async (userId) => {
    if (!user?.id) {
      console.error("Usuario no autenticado");
      return;
    }

    const data = {
      solicitante_id: user.id,
      solicitado_id: userId,
      estado: "pendiente",
    };

    try {
      const nuevaSolicitud = await createSolicitud(data);
      if(nuevaSolicitud && nuevaSolicitud.id){
        setSolicitudes((prev) => [...prev, nuevaSolicitud]);
      }
    } catch (error) {
      console.error("Error al crear la solicitud:", error);
    }
  };

  const handleCancelarSolicitud = async (userId) => {
    if (!user?.id) {
      console.error("Usuario no autenticado");
      return;
    }

    try {
      const solicitud = solicitudes.find(
        (s) => s && s.solicitado_id === userId && s.solicitante_id === user.id
      );

      if (!solicitud || !solicitud.id) {
        console.error("Solicitud no encontrada o ID inválido");
        return;
      }

      await deleteSolicitud(solicitud.id);

      setSolicitudes((prev) => prev.filter((s) => s && s.id !== solicitud.id));
    } catch (error) {
      console.error("Error al cancelar la solicitud:", error);
    }
  };

  const solicitudPendiente = (userId) =>
    solicitudes.some((s) => s.solicitado_id === userId);

  return (
    <div className="amigos-lista">
      <h2 className="amigos-titulo">Amigos Sugeridos</h2>
      {usuarios.length === 0 ? (
        <p>No hay usuarios sugeridos para mostrar.</p>
      ) : (
        usuarios.map((u) => (
          <div key={u.id} className="amigo-casual-card">
            <img
              src={
                u.foto_perfil
                  ? `${u.foto_perfil}`
                  : 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png'
              }
              alt={u.nombre_usuario}
              className="amigo-foto-casual"
            />
            <div className="amigo-info">
              <span className="amigo-nombre-casual">{u.nombre_usuario}</span>
              <p className="amigo-descripcion">{u.biografia}</p>
            </div>
            {solicitudPendiente(u.id) ? (
              <button
                className="btn-pendiente"
                onClick={() => handleCancelarSolicitud(u.id)}
                title="Cancelar solicitud"
              >
                Pendiente
              </button>
            ) : (
              <button
                className="btn-agregar"
                onClick={() => handleAgregarAmigo(u.id)}
              >
                Agregar
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
};
