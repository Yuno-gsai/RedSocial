import { useEffect, useState, useRef } from "react";
import { Mensajes } from "./Mensajes";
import { useAuth } from "../../Auths/Useauth";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import { io } from "socket.io-client";
import "/css/Mensajes/ContenedorMensajes.css";

export const ContenedorMensajes = () => {
  const { user } = useAuth();

  const [amigos, setAmigos] = useState([]);
  const [amigoSeleccionado, setAmigoSeleccionado] = useState(null);
  const [errorAmigos, setErrorAmigos] = useState(null);
  const [ultimosMensajes, setUltimosMensajes] = useState({});
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState({});
  const socketRef = useRef(null);

  const [pantallaPequena, setPantallaPequena] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setPantallaPequena(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchAmigos = async () => {
      setErrorAmigos(null);
      try {
        const response = await fetch(
          `https://backnode-b0fuhtf0e6hze6gp.canadacentral-01.azurewebsites.net`,
          {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
              controller: "Mensajes",  
              method: "obtenerAmigosConEstado",  
              data: {
                  usuario_id: user.id,
              },
          }),
          }
        );
        if (!response.ok) throw new Error("Error al cargar amigos con estado");
        const data = await response.json();

        setAmigos(data);

        const ultimos = {};
        const noLeidos = {};
        data.forEach((amistad) => {
          const amigoId =
            amistad.usuario1_id === user.id
              ? amistad.usuario2_id
              : amistad.usuario1_id;
          ultimos[amigoId] = amistad.ultimo_mensaje_texto || "";
          noLeidos[amigoId] = amistad.mensajes_no_leidos || 0;
        });
        setUltimosMensajes(ultimos);
        setMensajesNoLeidos(noLeidos);
      } catch (error) {
        setErrorAmigos(error.message || "Error al cargar amigos");
        setAmigos([]);
      }
    };

    fetchAmigos();
  }, [user]);

  useEffect(() => {
    if (!user || !amigoSeleccionado) return;

    const marcarLeido = async () => {
      try {
        await fetch("https://backnode-b0fuhtf0e6hze6gp.canadacentral-01.azurewebsites.net", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            controller: "Mensajes",  
            method: "marcarChatComoLeido",  
            data: {
              usuario_id: user.id,
              amigo_id: amigoSeleccionado.id,
            },
          }),
        });
        setMensajesNoLeidos((prev) => {
          const nuevo = { ...prev };
          delete nuevo[amigoSeleccionado.id];
          return nuevo;
        });
      } catch (error) {
        console.error("Error marcando chat como leído:", error);
      }
    };

    marcarLeido();
  }, [amigoSeleccionado, user]);

  useEffect(() => {
    if (!user) return;

    socketRef.current = io("https://backnode-b0fuhtf0e6hze6gp.canadacentral-01.azurewebsites.net");

    socketRef.current.on("nuevoMensaje", (data) => {
      const { remitente_id, destinatario_id, mensaje } = data;
      const userId = Number(user.id);

      if (remitente_id !== userId && destinatario_id !== userId) return;

      const idOtro = remitente_id === userId ? destinatario_id : remitente_id;

      setUltimosMensajes((prev) => ({
        ...prev,
        [idOtro]: mensaje,
      }));

      if (amigoSeleccionado?.id !== idOtro) {
        setMensajesNoLeidos((prev) => ({
          ...prev,
          [idOtro]: (prev[idOtro] || 0) + 1,
        }));
      }

      setAmigos((prevAmigos) => {
        const idx = prevAmigos.findIndex((amistad) => {
          const amigoId =
            amistad.usuario1_id === user.id
              ? amistad.usuario2_id
              : amistad.usuario1_id;
          return amigoId === idOtro;
        });

        if (idx === -1) return prevAmigos;

        const nuevaLista = [...prevAmigos];
        const [amigoMovido] = nuevaLista.splice(idx, 1);
        return [amigoMovido, ...nuevaLista];
      });
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user, amigoSeleccionado]);

  const obtenerAmigo = (amistad) => {
    if (!user || !amistad) return null;

    if (amistad.usuario1_id === user.id) {
      return {
        id: amistad.usuario2_id,
        nombre: amistad.usuario2_nombre || "Usuario sin nombre",
        foto: amistad.usuario2_foto,
      };
    }
    return {
      id: amistad.usuario1_id,
      nombre: amistad.usuario1_nombre || "Usuario sin nombre",
      foto: amistad.usuario1_foto,
    };
  };


  return (
    <div className="contenedor-mensajes">
      {(!pantallaPequena || !amigoSeleccionado) && (
        <div className="lista-amigos">
          <h2>Chats</h2>

          {errorAmigos && (
            <p style={{ margin: "16px", color: "red" }}>{errorAmigos}</p>
          )}

          {!errorAmigos && amigos.length === 0 && (
            <p style={{ margin: "16px", color: "#666" }}>
              No tienes amigos para mostrar.
            </p>
          )}

          {!errorAmigos &&
            amigos.length > 0 &&
            amigos.map((amistad) => {
              const amigo = obtenerAmigo(amistad);
              if (!amigo) return null;
              const seleccionado = amigoSeleccionado?.id === amigo.id;

              return (
                <div
                  key={amigo.id}
                  className={`amigo-item ${seleccionado ? "seleccionado" : ""}`}
                  onClick={() => setAmigoSeleccionado(amigo)}
                >
                  <Badge
                    color="error"
                    badgeContent={mensajesNoLeidos[amigo.id] || 0}
                    invisible={!mensajesNoLeidos[amigo.id]}
                    overlap="circular"
                  >
                    <Avatar
                      alt={amigo.nombre}
                      src={
                        amigo.foto
                          ? `${amigo.foto}`
                          : "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                      }
                      sx={{ width: 48, height: 48 }}
                    />
                  </Badge>
                  <div className="amigo-info">
                    <div className="amigo-nombre">{amigo.nombre}</div>
                    <div
                      className="amigo-ultimo-mensaje"
                      style={{ fontSize: "0.85em", color: "#555" }}
                    >
                      {ultimosMensajes[amigo.id] || "Sin mensajes"}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {(!pantallaPequena || amigoSeleccionado) && (
        <div className="panel-chat">
          {amigoSeleccionado ? (
            <Mensajes
              destinatarioId={amigoSeleccionado.id}
              destinatarioInfo={amigoSeleccionado}
              onVolver={() => setAmigoSeleccionado(null)}
            />
          ) : (
            <div className="chat-seleccionar">Selecciona un chat para comenzar</div>
          )}
        </div>
      )}
    </div>
  );
};
