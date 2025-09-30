import { useAuth } from "../Auths/Useauth";
import { toast } from "react-toastify";

export const useAuthHandlers = () => {
    const { LogIn } = useAuth();

    const handleLogin = async (email, password) => {
        try {
            const response = await fetch("https://backenphp-fxayemg5hnbtewb5.canadacentral-01.azurewebsites.net", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    controller: "User", 
                    method: "login",  
                    data: {
                        correo: email,
                        contrasena: password,
                    },
                }),
            });
    
            if (response.ok) {
                const data = await response.json();
    
                if (data.success && data.user) {
                    LogIn(data.user);  
                    return data.user;
                } else {
                    toast.error(data.message || "Usuario o contraseña incorrecta");
                    return null;
                }
            } else {
                toast.error("Credenciales incorrectas");
                return null;
            }
        } catch (error) {
            console.error("Error en la conexión:", error);
            toast.error("Error en la conexión con el servidor");
            return null;
        }
    };
    
    const getUser = async () => {
        try {
            const response = await fetch("https://backenphp-fxayemg5hnbtewb5.canadacentral-01.azurewebsites.net", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    controller: "User", 
                    method: "all", 
                }),
            });
            return response.json();
        } catch {
            return null;
        }
    };

    const handleRegister = async (UserData) => {
        try {
            const response = await fetch("https://backenphp-fxayemg5hnbtewb5.canadacentral-01.azurewebsites.net", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    controller: "User", 
                    method: "create", 
                    data: UserData,
                }),
            });
            const text = await response.text();
            try {
                const data = JSON.parse(text);
                if (data.success) {
                    toast.success("Usuario registrado correctamente");
                } else {
                    toast.error("Error en el registro");
                }
            } catch {
                console.error("Error en el registro:");
                toast.error("Error al conectar con el servidor.");
            }
        } catch {
            toast.error("Error en el registro");
            return null;
        }
    };

    const handleEditProfile = async (userData) => {
        try {
            const response = await fetch("https://backenphp-fxayemg5hnbtewb5.canadacentral-01.azurewebsites.net", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    controller: "User", 
                    method: "update", 
                    data: {
                        id: userData.id,
                        nombre_usuario: userData.nombre_usuario,
                        biografia: userData.biografia,
                        foto_perfil: userData.foto_perfil
                    },
                }),
            });
            const text = await response.text();
            try {
                const data = JSON.parse(text);
                if (data.success) {
                    toast.success("Perfil actualizado correctamente");
                } else {
                    toast.error("Error en la actualización del perfil");
                }
            } catch {
                console.error("Error en la actualización del perfil:");
                toast.error("Error al conectar con el servidor.");
            }
        } catch {
            toast.error("Error en la actualización del perfil");
            return null;
        }
    };

    const deleteCount = async (ID) => {
        try {
            const response = await fetch("https://backenphp-fxayemg5hnbtewb5.canadacentral-01.azurewebsites.net", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    controller: "User", 
                    method: "delete", 
                    data: {
                        id: ID, 
                    },
                }),
            });
            const text = await response.text();
            try {
                const data = JSON.parse(text);
                if (data.success) {
                    toast.success("Usuario eliminado correctamente");
                } else {
                    toast.error("Error en la eliminación del usuario");
                }
            } catch {
                console.error("Error en la eliminación del usuario:");
                toast.error("Error al conectar con el servidor.");
            }
        } catch {
            toast.error("Error en la eliminación del usuario");
            return null;
        }
    };

    const getUserDataById = async(id) =>{
        try{
            const response = await fetch("https://backenphp-fxayemg5hnbtewb5.canadacentral-01.azurewebsites.net",{
                method: "POST",
                headers:{
                    "Content-Type": "application/json",
                },
                body:JSON.stringify({
                    controller: "User", 
                    method:"getUserByID",
                    data:{
                        id:id
                    }   
                })
            })
            return response.json();
        }catch{
            return null
        }
    };

    const updataPassword = async (data) =>{
        try {
            const response = await fetch("https://backenphp-fxayemg5hnbtewb5.canadacentral-01.azurewebsites.net",{
                method: "POST",
                headers:{
                    "Content-Type": "application/json",
                },
                body:JSON.stringify({
                    controller: "User",
                    method:"update",
                    data:{
                        id:data.id,
                        contrasena:data.contrasena
                    }   
                })
            })
            return response.json();
        }catch{
            return null
        }
    }

    return { handleLogin, handleRegister, handleEditProfile, getUser, deleteCount, getUserDataById,updataPassword };
};
