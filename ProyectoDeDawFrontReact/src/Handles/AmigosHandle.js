import { useAuth } from "../Auths/Useauth";
import { useCallback } from "react";

export const useAmigosHandle = () => {
    const { user } = useAuth();

    const getAmigos = useCallback(async () => {
        try {
        const response = await fetch("https://backenphp-fxayemg5hnbtewb5.canadacentral-01.azurewebsites.net", {
        method: "POST", 
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            controller: "Friends", 
            method: "all" 
        }),
        });
  
        if (!response.ok) {
            throw new Error("Error al obtener amigos");
        }
  
        const data = await response.json();
        const amigos = data.filter(
        (amigo) => amigo.usuario1_id === user.id || amigo.usuario2_id === user.id
      );
      return amigos;
    } catch (error) {
      console.error("Error:", error);
      // manejo de error
    }
    }, [user?.id]);
  

    const deleteAmigos  = async (ID) =>{
        try{
            const response = await fetch(`https://backenphp-fxayemg5hnbtewb5.canadacentral-01.azurewebsites.net`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    controller: "Friends", 
                    method: "delete", 
                    data: {
                        id: ID, 
                    },
                }),
            });
            if (!response.ok) {
                throw new Error("Error al eliminar amigo");
            }
            console.log("Amigo eliminado exitosamente");
        }
        catch(error){
            console.log(error)
            alert("error al eliminar amigo")
        }
    }
    const createSolicitud = async (data) =>{
        try{
            const response = await fetch("https://backenphp-fxayemg5hnbtewb5.canadacentral-01.azurewebsites.net", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    controller: "solicitud", 
                    method: "create", 
                    data: data,
                }),
            });
            if (!response.ok) {
                throw new Error("Error al crear amigo");
            }
            console.log("Amigo creado exitosamente");
        }
        catch(error){
            console.log(error)
        }
    }

    const getSolicitudes = async () => {
        try{
            const response = await fetch("https://backenphp-fxayemg5hnbtewb5.canadacentral-01.azurewebsites.net", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    controller: "solicitud", 
                    method: "all" 
                }),
            });
            const data = await response.json();
            return data;
        }
        catch(error){
            console.log(error)
        }
    }
    const deleteSolicitud = async (ID) =>{
        try{
            const response = await fetch(`https://backenphp-fxayemg5hnbtewb5.canadacentral-01.azurewebsites.net`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    controller: "solicitud", 
                    method: "delete", 
                    data: {
                        id: ID, 
                    },
                }),
            });
            if (!response.ok) {
                throw new Error("Error al eliminar solicitud");
            }
            console.log("Solicitud eliminada exitosamente");
        }
        catch(error){
            console.log(error)
            alert("error al eliminar solicitud")
        }
    }
    const updateSolicitud = async (ID,estado) =>{
            try{
                const response = await fetch(`https://backenphp-fxayemg5hnbtewb5.canadacentral-01.azurewebsites.net`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        controller: "solicitud", 
                        method: "update", 
                        data: {
                            id: ID, 
                            estado: estado,
                        },
                    }),
                });
                if (!response.ok) {
                    throw new Error("Error al aceptar solicitud");
                }
                console.log("Solicitud aceptada exitosamente");
            }
            catch(error){
                console.log(error)
                alert("error al aceptar solicitud")
            }
        }
    const AgregarAmigo = async (data) =>{
        try{
            const response = await fetch("https://backenphp-fxayemg5hnbtewb5.canadacentral-01.azurewebsites.net", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    controller: "Friends", 
                    method: "create", 
                    data: data,
                }),
            });
            if (!response.ok) {
                throw new Error("Error al agregar amigo");
            }
            console.log("Amigo agregado exitosamente");
        }
        catch(error){
            console.log(error)
            alert("error al agregar amigo")
        }
    }

    return { getAmigos, deleteAmigos, createSolicitud, getSolicitudes, deleteSolicitud, updateSolicitud, AgregarAmigo }
}