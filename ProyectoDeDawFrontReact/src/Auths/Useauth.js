import { useContext } from "react";
import { AuthContext } from "../Contex/AuthContex";

export const useAuth = () => {
    return useContext(AuthContext);
};