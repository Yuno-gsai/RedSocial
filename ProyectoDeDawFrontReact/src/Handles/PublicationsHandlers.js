import { useAuth } from "../Auths/Useauth";

export const usePublicationsHandlers = () => {
  const { user } = useAuth();

  const handleGetUserPublications = async (userID) => {
    try {
      const response = await fetch("https://backenphp-fxayemg5hnbtewb5.canadacentral-01.azurewebsites.net", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          controller: "Publications", 
          method: "all", 
        }),
      });

      const data = await response.json();

      const publicacionesDelUsuario = data.filter(pub => pub.usuario_id === userID);
      return publicacionesDelUsuario;
    } catch (error) {
      console.error("Error al obtener publicaciones:", error.message);
      return [];
    }
  };

  const handleCreatePublication = async (publicationData) => {
    try {
      const response = await fetch("https://backenphp-fxayemg5hnbtewb5.canadacentral-01.azurewebsites.net", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          controller: "Publications", 
          method: "create", 
          data: {
            usuario_id: user.id,
            contenido: publicationData.contenido,
            imagen: publicationData.imagen,
          }
        }),
      });
  
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        if (data.success) {
          return data;
        } else {
          alert("Error al crear la publicación");
          return null;
        }
      } catch (error) {
        console.error("Error en la respuesta JSON:", error);
        alert("Respuesta inválida del servidor.");
        return null;
      }
    } catch (error) {
      console.error("Error al crear publicación:", error);
      alert("Error al conectar con el servidor.");
      return null;
    }
  };


  const handleGetFriendsPublications = async () => {
    try {
      const response = await fetch(
        `https://backenphp-fxayemg5hnbtewb5.canadacentral-01.azurewebsites.net`,
        {
          method: "POST", 
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            controller: "Publications", 
            method: "amigos", 
            data: {
              usuario_id: user.id,
            },
          }),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener publicaciones de amigos:", error);
      return null;
    }
  };

  const deletePublication = async (ID) => {
    try {
      const response = await fetch(
        `https://backenphp-fxayemg5hnbtewb5.canadacentral-01.azurewebsites.net`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            controller: "Publications", 
            method: "delete", 
            data: {
              id: ID, 
            },
          }),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al eliminar publicación:", error);
      return null;
    }
  };

  const GetDataByUserID = async (userID) =>{
    try{
      const response = await fetch(
        `https://backenphp-fxayemg5hnbtewb5.canadacentral-01.azurewebsites.net`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            controller: "Publications", 
            method: "GetPublicationsByUserID", 
            data: {
              usuario_id: userID
            },
          }),
        }
      );
      const data = await response.json();
      return data;
    }catch(error){
      console.error("Error al obtener publicaciones de amigos:", error);
      return null;
    }
  }
  return { handleGetUserPublications, handleCreatePublication, handleGetFriendsPublications, deletePublication,GetDataByUserID };
};
