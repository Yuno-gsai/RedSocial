import React, { useEffect, useState } from "react";
import { usePublicationsHandlers } from "../../Handles/PublicationsHandlers";
import { FriendsPerfil } from "../CustonPerfil/FriendsPerfil";
import { Publicacion } from "../Publications/Publications";
import "/css/Conten/Conten.css";

export const Conten = () => {
  const { handleGetFriendsPublications } = usePublicationsHandlers();
  const [friendsPublications, setFriendsPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await handleGetFriendsPublications();
        const formattedData = data.map(pub => ({
          ...pub,
          comentarios: pub.comentarios || [],
          likes: pub.likes || []
        }));
        setFriendsPublications(formattedData);
      } catch (error) {
        console.error("Error fetching friends' publications:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [handleGetFriendsPublications]);

  if (loading) return <p>Cargando publicaciones de amigos...</p>;

  if (selectedUserId) {
    return (
      <div className="friends-perfil-view">
        <FriendsPerfil 
          userid={selectedUserId} 
          onClose={() => setSelectedUserId(null)} 
        />
      </div>
    );
  }

  return (
    <div className="conten-container">
      {friendsPublications.length === 0 ? (
        <p>No hay publicaciones de tus amigos aún.</p>
      ) : (
        <div className="friends-publications">
          {friendsPublications.map((pub) => (
            <div key={pub.id} className="friend-publication">
              <div className="publicacion-header">
                <div className="perfil-usuario">
                  <img
                    src={
                      pub.foto_perfil || 
                      "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
                    }
                    alt={`${pub.nombre_usuario} perfil`}
                    className="perfil-foto"
                    onClick={() => setSelectedUserId(pub.usuario_id)}
                  />
                  <span className="perfil-nombre">{pub.nombre_usuario}</span>
                </div>
              </div>
              
              <Publicacion 
                userID={pub.usuario_id}
                singlePublication={{
                  ...pub,
                  comentarios: pub.comentarios || [],
                  likes: pub.likes || []
                }}
                showHeader={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
