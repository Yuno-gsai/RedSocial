import React, { useEffect, useState } from "react";
import { usePublicationsHandlers } from "../../Handles/PublicationsHandlers";
import { NewLike } from "../Likes/NewLike";
import { Comentarios } from "../Coments/Comentarios";
import { NewComent } from "../Coments/NewComent";
import { useAuth } from "../../Auths/Useauth";
import "/css/Publicaciones/Publications.css";

export const Publicacion = ({ userID, singlePublication, showHeader = true }) => {
  const { handleGetUserPublications, deletePublication } = usePublicationsHandlers();
  const [publicaciones, setPublicaciones] = useState(singlePublication ? [singlePublication] : []);
  const [loading, setLoading] = useState(!singlePublication);
  const [comentarioEnEdicion, setComentarioEnEdicion] = useState(null);
  const { user } = useAuth();

  const fetchPublications = async () => {
    try {
      const publicacionesData = await handleGetUserPublications(userID);
      const publicacionesOrdenadas = publicacionesData.sort(
        (a, b) => new Date(b.creado_en) - new Date(a.creado_en)
      );
      setPublicaciones(publicacionesOrdenadas);
    } catch (error) {
      console.error("Error fetching publications:", error);
    }
  };

  useEffect(() => {
    if (!singlePublication) {
      fetchPublications().finally(() => setLoading(false));
    }
  }, [handleGetUserPublications, userID, singlePublication]);

  const onNuevoComentario = (publicationId) => {
    setComentarioEnEdicion(publicationId);
  };

  const handleCancelComentario = () => {
    setComentarioEnEdicion(null);
  };

  const renderPublication = (pub) => {
    const isOwner = user && user.id === pub.usuario_id;

    return (
      <div key={pub.id} className="publicacion-card">
        {showHeader && (
          <div className="publicacion-header">
            <p className="publicacion-fecha">
              Publicado el: {new Date(pub.creado_en).toLocaleString()}
            </p>
            {isOwner && (
              <button
                className="btn-eliminar"
                type="button"
                onClick={() => deletePublication(pub.id)}
              >
                ×
              </button>
            )}
          </div>
        )}

        <p className="publicacion-contenido">{pub.contenido}</p>

        {pub.imagen && pub.imagen !== "Update Imagen" && (
          <img
            src={pub.imagen}
            alt="Imagen de publicación"
            className="publicacion-imagen"
          />
        )}

        <div className="acciones-publicacion">
          <NewLike
            publicationId={pub.id}
            userID={user.id}
            likesCount={pub.totalLikes || 0}
            userHasLiked={pub.likes?.some(like => like.usuario_id === user.id) || false}
            likeId={pub.likes?.find(like => like.usuario_id === user.id)?.id}
          />
          <button
            className="buttonClass"
            type="button"
            onClick={() => onNuevoComentario(pub.id)}
          >
            Comentar
          </button>
        </div>

        <div className="comentarios-section">
          <Comentarios
            comentarios={pub.comentarios || []}
            onActualizar={fetchPublications}
          />

          {comentarioEnEdicion === pub.id && (
            <NewComent
              publicationId={pub.id}
              userId={user.id}
              onNuevoComentario={handleCancelComentario}
              onComentarioGuardado={fetchPublications}
            />
          )}
        </div>
      </div>
    );
  };

  if (loading) return <p>Cargando publicaciones...</p>;

  return (
    <div className="publicaciones-container">
      {publicaciones.length === 0 ? (
        <p>No hay publicaciones aún.</p>
      ) : (
        publicaciones.map(renderPublication)
      )}
    </div>
  );
};
