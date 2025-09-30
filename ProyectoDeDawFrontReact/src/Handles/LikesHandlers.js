export const useLikesHandlers = () => {
    

    const handleCreateLike = async (Data) => {
        try {
            const response = await fetch("https://backenphp-fxayemg5hnbtewb5.canadacentral-01.azurewebsites.net", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    controller: "Likes", 
                    method: "create", 
                    data: Data,
                }), 
            });
    
            const text = await response.text();
            try {
                const data = JSON.parse(text);
                if (data.success) {
                    return data;
                } else {
                    alert("Error al crear el like");
                    return null;
                }
            } catch (error) {
                console.error("Error en respuesta JSON:", error);
                alert("Respuesta inválida del servidor.");
                return null;
            }
        } catch (error) {
            console.error("Error al crear el like:", error.message, error);
            alert("Error al crear el like");
            return null;
        }
    };

    const handleDeleteLike = async (likeId) => {
        try {
            const response = await fetch(`https://backenphp-fxayemg5hnbtewb5.canadacentral-01.azurewebsites.net`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    controller: "Likes", 
                    method: "delete", 
                    data: {
                        id: likeId, 
                    },
                }),
            });
    
            const text = await response.text();
            try {
                const data = JSON.parse(text);
                if (data.success) {
                    return data;
                } else {
                    alert("Error al eliminar el like");
                    return null;
                }
            } catch (error) {
                console.error("Error en respuesta JSON:", error);
                alert("Respuesta inválida del servidor.");
                return null;
            }
        } catch (error) {
            console.error("Error al eliminar el like:", error.message, error);
            alert("Error al eliminar el like");
            return null;
        }
    };

    return { handleCreateLike,handleDeleteLike };
};
