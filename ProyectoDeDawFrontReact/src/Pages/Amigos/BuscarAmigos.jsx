import { useAuth } from "../../Auths/Useauth";
import { useAuthHandlers } from "../../Handles/UserauthHandlers";
import { useEffect, useState } from "react";
import "/css/Amigos/AmigosRender.css";
import { useAmigosHandle } from "../../Handles/AmigosHandle";

export const BuscarAmigos = () => {
  const { getUser } = useAuthHandlers();
  const { user } = useAuth();
  const { createSolicitud, getSolicitudes, deleteSolicitud, getAmigos } = useAmigosHandle();

  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [solicitudes, setSolicitudes] = useState([]);
  const [amigos, setAmigos] = useState([]); 

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const usuariosData = await getUser();

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

        if (Array.isArray(usuariosData)) {
          const usuariosFiltrados = usuariosData.filter(
            (u) => u && u.id !== user?.id && !amigosIds.has(u.id)
          );
          setUsuarios(usuariosFiltrados);
        } else {
          console.error("Los datos de usuarios no son válidos:", usuariosData);
          setUsuarios([]);
        }

        try {
          const solicitudesData = await getSolicitudes();
          if (Array.isArray(solicitudesData)) {
            const pendientes = solicitudesData.filter(
              (s) => s && s.solicitante_id === user?.id && s.estado === "pendiente"
            );
            setSolicitudes(pendientes);
          } else {
            console.error("Los datos de solicitudes no son válidos:", solicitudesData);
            setSolicitudes([]);
          }
        } catch (solicitudError) {
          console.error("Error cargando solicitudes:", solicitudError);
          setSolicitudes([]);
        }
      } catch (error) {
        console.error("Error cargando usuarios:", error);
        setUsuarios([]);
        setSolicitudes([]);
        setAmigos([]);
      }
    };

    fetchDatos();
  }, [getUser, getSolicitudes, getAmigos, user]);

  const handleAgregarAmigo = async (userId) => {
    const data = {
      solicitante_id: user.id,
      solicitado_id: userId,
      estado: "pendiente",
    };
    try {
      await createSolicitud(data);
      setSolicitudes((prev) => [...prev, data]);
    } catch (error) {
      console.error("Error creando solicitud:", error);
    }
  };

  const handleCancelarSolicitud = async (userId) => {
    try {
      const solicitud = solicitudes.find(
        (s) => s.solicitado_id === userId && s.solicitante_id === user.id
      );
      if (!solicitud) return;

      await deleteSolicitud(solicitud.id);

      setSolicitudes((prev) => prev.filter((s) => s.id !== solicitud.id));
    } catch (error) {
      console.error("Error cancelando solicitud:", error);
    }
  };

  const solicitudPendiente = (userId) =>
    solicitudes.some((s) => s.solicitado_id === userId);

  const usuariosBuscados =
    busqueda.trim() === ""
      ? []
      : usuarios.filter((u) => {
          const nombre = u.nombre_usuario ? u.nombre_usuario.toLowerCase() : "";
          const correo = u.correo ? u.correo.toLowerCase() : "";
          const texto = busqueda.toLowerCase();
          return nombre.includes(texto) || correo.includes(texto);
        });

  return (
    <div className="amigos-lista">
      <h2 className="amigos-titulo">Buscar Amigos</h2>
      <input
        type="text"
        placeholder="Buscar por nombre o correo"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{
          padding: "8px",
          width: "100%",
          marginBottom: "12px",
          boxSizing: "border-box",
        }}
      />
      {busqueda.trim() === "" ? (
        <p>Escribe para comenzar la búsqueda...</p>
      ) : usuariosBuscados.length === 0 ? (
        <p>No se encontraron usuarios.</p>
      ) : (
        usuariosBuscados.map((u) => (
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
