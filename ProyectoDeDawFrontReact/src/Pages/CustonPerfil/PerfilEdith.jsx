import { useState } from "react";
import { useAuth } from "../../Auths/Useauth";
import { useAuthHandlers } from "../../Handles/UserauthHandlers";
import "/css/Perfil/PerfilEdith.css";

export const PerfilEdith = ({ onCancel }) => {
    const { user } = useAuth();
    const { handleEditProfile } = useAuthHandlers();
    const { handleLogin } = useAuthHandlers();

    const [nombre, setNombre] = useState(user.nombre_usuario || "");
    const [biografia, setBiografia] = useState(user.biografia || "");
    const [fotoPerfil, setFotoPerfil] = useState(user.foto_perfil || "");
    const [contrasena, setContrasena] = useState(user.contrasena || "");

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPerfil(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        await handleEditProfile({
            id: user.id,
            nombre_usuario: nombre,
            biografia: biografia,
            foto_perfil: fotoPerfil,
        });

        handleLogin(user.correo, contrasena);
        onCancel(); 
    };

    const handleDeletePhoto = () => {
        setFotoPerfil(""); 
    };

    return (
        <div className="profile-container">
            <h2>Editar Perfil</h2>
            <form className="edit-profile-form" onSubmit={handleSubmit}>
                <label>
                    Foto de perfil:
                    <label className="custom-file-upload">
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                        📁 Subir imagen
                    </label>
                </label>

                <label>
                    Nombre de usuario:
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Nombre de usuario"
                        required
                    />
                </label>

                <label>
                    Biografía:
                    <textarea
                        value={biografia}
                        onChange={(e) => setBiografia(e.target.value)}
                        placeholder="Escribe tu biografía"
                        rows={4}
                    />
                </label>
                <label>
                    Ingrese su contraseña:
                    <input
                        type="password"
                        value={contrasena}
                        onChange={(e) => setContrasena(e.target.value)}
                        placeholder="Ingrese su contraseña"
                        required
                    />
                </label>

                <div className="btn-group">
                    <button className="buttonClass" type="submit">Guardar cambios</button>
                    <button className="buttonClass" onClick={handleDeletePhoto}>Eliminar Foto</button>
                    <button type="button" onClick={onCancel} className="btn-cancel">
                        Cancelar
                    </button>
                </div>
            </form>

            {fotoPerfil && fotoPerfil.startsWith("data:image") && (
                <div className="preview">
                    <p>Vista previa:</p>
                    <img src={fotoPerfil} alt="Vista previa" style={{ maxWidth: "150px", borderRadius: "10px" }} />
                </div>
            )}
        </div>
    );
};
