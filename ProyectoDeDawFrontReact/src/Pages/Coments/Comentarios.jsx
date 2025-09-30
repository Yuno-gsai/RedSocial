import React, { useState } from "react";
import "/css/Comentarios/Coments.css";
import { useComentariosHandlers } from "../../Handles/ComentariosHandlers";
import { useAuth } from "../../Auths/Useauth";

export const Comentarios = ({ comentarios, onActualizar }) => {
    const [mostrarTodos, setMostrarTodos] = useState(false);
    const { handleDeleteComentario } = useComentariosHandlers();
    const { user } = useAuth();

    if (!comentarios || comentarios.length === 0) {
        return <p className="sin-comentarios">No hay comentarios aún.</p>;
    }

    const comentariosOrdenados = [...comentarios].sort(
        (a, b) => new Date(b.creado_en) - new Date(a.creado_en)
    );

    const comentariosAMostrar = mostrarTodos
        ? comentariosOrdenados
        : comentariosOrdenados.slice(0, 1);

    const handleEliminar = async (comentarioId) => {
        try {
        await handleDeleteComentario(comentarioId);
        onActualizar?.(); // volver a cargar publicaciones
        } catch (error) {
        console.error("Error al eliminar comentario:", error);
        }
    };

    return (
        <div className="comentarios-lista">
        {comentariosAMostrar.map((comentario) => (
            <div key={comentario.id} className="comentario">
            <img
                src={
                comentario.foto_perfil
                    ? `${comentario.foto_perfil}`
                    : "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
                }
                alt="Foto del usuario"
                className="comentario-foto"
            />
            <div className="comentario-texto">
                <strong>{comentario.nombre_usuario}</strong>
                <p>{comentario.contenido}</p>
                <small>{new Date(comentario.creado_en).toLocaleString()}</small>
                {user.id === comentario.usuario_id && (
                <button
                    onClick={() => handleEliminar(comentario.id)}
                    className="EliminarButton"
                >
                    Eliminar
                </button>
                )}
            </div>
            </div>
        ))}

        {comentarios.length > 1 && (
            <button className="buttonClass" onClick={() => setMostrarTodos(!mostrarTodos)}>
            {mostrarTodos ? "Ver Menos" : "Ver Todos"}
            </button>
        )}
        </div>
    );
};
