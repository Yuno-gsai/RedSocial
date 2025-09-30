import { useState } from "react";
import { LeftBar } from "./LeftBar";
import { CustomView } from "./CustonView";
import "/css/Menu/Menu.css";

export const Menu = () => {
    const [selected, setSelected] = useState("inicio");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="menu-container">
        <button 
            className="hamburger-btn" 
            onClick={toggleSidebar} 
            aria-label="Abrir menú"
        >
            ☰
        </button>

        <LeftBar 
            onSelect={(item) => {
            setSelected(item);
            setSidebarOpen(false); 
            }} 
            selected={selected} 
            isOpen={sidebarOpen}
        />
        
        <CustomView selected={selected} />
        </div>
    );
};
