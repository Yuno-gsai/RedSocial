import { useState } from "react";
import { usePublicationsHandlers } from "../../Handles/PublicationsHandlers";
import "/css/Publicaciones/NewPublication.css";
import { useAuth } from "../../Auths/Useauth";

export const NewPublication = ({ onCancel }) => {
    const [content, setContent] = useState("");
    const { handleCreatePublication } = usePublicationsHandlers();
    const [foto, setFoto] = useState(null); 
    const { user } = useAuth();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFoto(reader.result); 
            };
            reader.readAsDataURL(file);
        } else {
            alert("Por favor selecciona una imagen válida.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const data = {
            usuario_id: user.id,
            contenido: content,
            imagen: foto, 
        };

        await handleCreatePublication(data);

        onCancel(); 
    };

    return (
        <div className="new-publication-container">
            <form onSubmit={handleSubmit} className="new-publication-form">
                <label htmlFor="contenido" className="label-textarea">
                    ¿Qué está pasando?
                </label>
                <textarea
                    id="contenido"
                    name="contenido"
                    placeholder="Escribe algo..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={4}
                    className="textarea-content"
                />

                <label htmlFor="imagen" className="label-file">
                    Adjuntar imagen
                </label>
                <label htmlFor="imagen" className="custom-file-upload">
                    {foto ? "Imagen seleccionada" : "Seleccionar imagen"}
                </label>
                <input
                    type="file"
                    id="imagen"
                    name="imagen"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="input-file-hidden"
                />

                <div className="button-group">
                    <button type="submit" className="btn-submit">
                        Publicar
                    </button>
                    <button type="button" onClick={onCancel} className="btn-cancel">
                        Cancelar
                    </button>
                </div>
            </form>

            {foto && foto.startsWith("data:image") && (
                <div className="preview">
                    <p>Vista previa de la imagen:</p>
                    <img src={foto} alt="Vista previa" style={{ maxWidth: "150px", borderRadius: "10px" }} />
                </div>
            )}
        </div>
    );
};
