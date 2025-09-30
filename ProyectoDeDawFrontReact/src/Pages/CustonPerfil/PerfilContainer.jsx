import { useState } from "react";
import { PerfilView } from "./PerfilView";
import { PerfilEdith } from "./PerfilEdith";

export const PerfilContainer = () => {
    const [editando, setEditando] = useState(false);

    return (
        <>
            {editando ? (
                <PerfilEdith onCancel={() => setEditando(false)} />
            ) : (
                <PerfilView onEdit={() => setEditando(true)}  />
            )}
        </>
    );
};
