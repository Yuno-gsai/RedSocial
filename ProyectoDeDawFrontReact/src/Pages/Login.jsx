import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "/css/Login/Login.css";

export const Login = ({ handleLogin }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate(); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = await handleLogin(email, password);
        if (user) {
            navigate("/");
        }
    };

    const goToRegister = () => {
        navigate("/register"); 
    };

    return (
        <form className="login-form" onSubmit={handleSubmit}>
        <input 
            className="login-input" 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required
        />
        <input 
            className="login-input" 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            required
        />
        <button className="login-btn login-btn-primary" type="submit">Iniciar sesión</button>
        <button className="login-btn login-btn-secondary" type="button" onClick={goToRegister}>Registrarse</button>
        </form>
    );
};
