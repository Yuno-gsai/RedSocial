import { useState } from "react";
import { useAuthHandlers } from "../Handles/UserauthHandlers";
import { useNavigate } from "react-router-dom";
import { enviarCorreoBienvenida } from "../utils/emailUtils"; 
import "/css/Login/Register.css";

export const Register = () => {
    const [email, setEmail] = useState(""); 
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const { handleRegister } = useAuthHandlers();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const userData = {
        nombre_usuario: name,
        correo: email,
        contrasena: password
        };

        try {
        const user = await handleRegister(userData);
        await enviarCorreoBienvenida(email, name);
        navigate("/");
        if (user) {
            setSuccess("Registro exitoso");
            try {
            setSuccess("Registro y correo enviados correctamente.");
            } catch {
            setSuccess("Registro exitoso, pero no se pudo enviar el correo.");
            }
        } else {
            setError("Error al registrar el usuario.");
        }
        } catch {
        setError("Hubo un problema con el registro.");
        }
    };

    return (
        <div className="register-container">
        <h1 className="register-title">Registrarte</h1>
        <form className="register-form" onSubmit={handleSubmit}>
            <input
            className="register-input"
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            />
            <input
            className="register-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
            <input
            className="register-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
            <button className="register-btn" type="submit">Registrarse</button>
        </form>

        {success && <p className="register-success">{success}</p>}
        {error && <p className="register-error">{error}</p>}
        </div>
    );
};
