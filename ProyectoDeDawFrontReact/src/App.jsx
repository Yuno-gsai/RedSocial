import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "./Auths/Useauth";
import { useAuthHandlers } from "./Handles/UserauthHandlers";
import { Login } from "./Pages/Login";
import { Register } from "./Pages/Register";
import { Menu } from "./Pages/Home/Menu";
import { PerfilView } from "./Pages/CustonPerfil/PerfilView";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const App = () => {
    const { user } = useAuth();
    const { handleLogin } = useAuthHandlers();

    return (
        <Router>
        <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
        />
        <Routes>
            <Route
            path="/"
            element={
                user ? (
                <Menu />
                ) : (
                <Login handleLogin={handleLogin} />
                )
            }
            />
            <Route path="/register" element={<Register />} />
            <Route path="/perfil" element={<PerfilView />} />
        </Routes>
        </Router>
    );
};
