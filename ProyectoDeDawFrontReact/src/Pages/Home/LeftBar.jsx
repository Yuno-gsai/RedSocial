import { useAuth } from "../../Auths/Useauth";

export const LeftBar = ({ onSelect, selected, isOpen }) => {
    const { user, LogOut } = useAuth();

    return (
        <aside className={`left-sidebar ${isOpen ? "open" : ""}`}>
        <nav className="sidebar">
            <div className="logo">{user.nombre_usuario}</div>
            <ul>
            <li
                style={{ cursor: "pointer", fontWeight: selected === "inicio" ? "bold" : "normal" }}
                onClick={() => onSelect("inicio")}
            >
                🏠 Inicio
            </li>
            <li
                style={{ cursor: "pointer", fontWeight: selected === "amigos" ? "bold" : "normal" }}
                onClick={() => onSelect("amigos")}
            >
                🫂 Amigos
            </li>
            <li
                style={{ cursor: "pointer", fontWeight: selected === "mensajes" ? "bold" : "normal" }}
                onClick={() => onSelect("mensajes")}
            >
                ✉️ Mensajes
            </li>
            <li
                style={{ cursor: "pointer", fontWeight: selected === "perfil" ? "bold" : "normal" }}
                onClick={() => onSelect("perfil")}
            >
                👤 Perfil
            </li>
            <li
                style={{ cursor: "pointer", fontWeight: selected === "configuracion" ? "bold" : "normal" }}
                onClick={() => onSelect("configuracion")}
            >
                ⚙️ Configuración
            </li>
            <li onClick={LogOut} style={{ cursor: "pointer", fontWeight: "normal" }}>
                🚪 Salir
            </li>
            </ul>
        </nav>
        </aside>
    );
};
