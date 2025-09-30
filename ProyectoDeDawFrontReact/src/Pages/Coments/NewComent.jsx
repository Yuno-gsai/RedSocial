import React, { useState } from "react";
import { useComentariosHandlers } from "../../Handles/ComentariosHandlers";
import "/css/Comentarios/NewComent.css";

export const NewComent = ({ publicationId, userId, onNuevoComentario, onComentarioGuardado }) => {
  const [contenido, setContenido] = useState("");
  const { handleCreateComentario } = useComentariosHandlers();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contenido.trim()) return;

    try {
      await handleCreateComentario({
        publicacion_id: publicationId,
        usuario_id: userId,
        contenido: contenido.trim(),
      });

      setContenido("");
      onNuevoComentario?.(); // cierra formulario
      onComentarioGuardado?.(); // refresca lista
    } catch (error) {
      console.error("Error al crear comentario:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="nuevo-comentario-form">
      <textarea
        placeholder="Escribe un comentario..."
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
        rows={3}
        required
        className="comentario-textarea"
      />
      <div className="comentarios-actions">
        <button type="submit" className="btn-enviar-comentario">Comentar</button>
        <button type="button" className="btn-cancelar-comentario" onClick={onNuevoComentario}>
          Cancelar
        </button>
      </div>
    </form>
  );
};
