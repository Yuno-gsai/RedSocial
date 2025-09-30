import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../../Auths/Useauth";
import "/css/Mensajes/Mensajes.css";

export const Mensajes = ({ destinatarioId, destinatarioInfo, onVolver }) => {
  const { user } = useAuth();
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const socketRef = useRef(null);
  const contenedorRef = useRef(null);

  useEffect(() => {
    if (!user || !destinatarioId) return;

    socketRef.current = io("https://backnode-b0fuhtf0e6hze6gp.canadacentral-01.azurewebsites.net");

    socketRef.current.on("nuevoMensaje", (msg) => {
      const esRelevante =
        (msg.remitente_id === user.id && msg.destinatario_id === destinatarioId) ||
        (msg.remitente_id === destinatarioId && msg.destinatario_id === user.id);

      if (esRelevante) {
        setMensajes((prev) => [...prev, msg]);
      }
    });

    fetch(
      `https://backnode-b0fuhtf0e6hze6gp.canadacentral-01.azurewebsites.net`,
      {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({
          controller: "Mensajes",  
          method: "obtenerMensajesHandler",  
          data: {
              remitente_id: user.id,
              destinatario_id: destinatarioId,
          },
      }),
      }
    )
      .then((res) => res.json())
      .then((data) => setMensajes(data))
      .catch((err) => console.error("Error cargando mensajes:", err));

    return () => {
      socketRef.current.disconnect();
    };
  }, [user, destinatarioId]);

  useEffect(() => {
    if (contenedorRef.current) {
      contenedorRef.current.scrollTop = contenedorRef.current.scrollHeight;
    }
  }, [mensajes]);

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !socketRef.current) return;

    const timestamp = new Date().toISOString();

    const mensajeObj = {
      remitente_id: user.id,
      destinatario_id: destinatarioId,
      mensaje: nuevoMensaje.trim(),
      enviado_en: timestamp,
    };

    socketRef.current.emit("nuevoMensaje", mensajeObj);

    try {
      const response = await fetch("https://backnode-b0fuhtf0e6hze6gp.canadacentral-01.azurewebsites.net", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          controller: "Mensajes",  
          method: "crearMensajeHandler",  
          data: mensajeObj,
        }),
      });

      if (!response.ok) {
        console.error("Error guardando mensaje en la BD:", await response.text());
      }
    } catch (err) {
      console.error("Error en la petición POST:", err);
    }

    setNuevoMensaje("");
  };

  return (
    <div className="mensajes-contenedor">
      <div className="chat-header">
        <button className="btn-volver" onClick={onVolver}>
          ⬅
        </button>
        <img
          src={
            destinatarioInfo?.foto
              ? `${destinatarioInfo.foto}`
              : "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
          }
          alt="Perfil"
          className="chat-header-foto"
        />
        <span className="chat-header-nombre">{destinatarioInfo?.nombre || "Usuario"}</span>
      </div>

      <div className="mensajes-lista" ref={contenedorRef}>
        {mensajes.length === 0 ? (
          <p style={{ color: "#666", textAlign: "center", marginTop: "20px" }}>
            No hay mensajes aún.
          </p>
        ) : (
          mensajes.map((m, i) => {
            const esRemitente = m.remitente_id === user.id;
            return (
              <div
                key={i}
                className={`mensaje-item ${esRemitente ? "remitente" : "destinatario"}`}
              >
                <div className={`mensaje-burbuja ${esRemitente ? "remitente" : "destinatario"}`}>
                  {m.mensaje}
                </div>
                <div className="mensaje-fecha">{new Date(m.enviado_en).toLocaleString()}</div>
              </div>
            );
          })
        )}
      </div>

      <div className="mensaje-input-contenedor">
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") enviarMensaje();
          }}
          className="mensaje-input"
        />
        <button onClick={enviarMensaje} className="mensaje-boton">
          Enviar
        </button>
      </div>
    </div>
  );
};
