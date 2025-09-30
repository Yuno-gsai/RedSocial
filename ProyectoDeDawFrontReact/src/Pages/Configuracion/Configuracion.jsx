import { useState } from "react";
import { useAuthHandlers } from "../../Handles/UserauthHandlers";
import { useAuth } from "../../Auths/Useauth";
import "/css/Configuracion/Configuracion.css";

export const Configuracion = () => {
  const { user, LogOut } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const { deleteCount,updataPassword } = useAuthHandlers();

  const handleChangePassword = async () => {
    setErrorMessage("");
    setStatusMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Todos los campos son obligatorios.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("La nueva contraseña y la confirmación no coinciden.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    
    try {
      await updataPassword({contrasena:newPassword,id:user.id});

      setStatusMessage("Contraseña cambiada con éxito.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setErrorMessage("Error al cambiar la contraseña.");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "¿Estás seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer."
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      await deleteCount(user.id);

      setStatusMessage("Cuenta eliminada correctamente.");
      LogOut();
    } catch {
      setErrorMessage("Error al eliminar la cuenta.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="config-container">
      <h1>Configuración</h1>
  
      <section>
        <h2>Cambiar Contraseña</h2>
        <label>
          Contraseña Actual:
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        <label>
          Nueva Contraseña:
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>
        <label>
          Confirmar Nueva Contraseña:
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>
        <button className="btn-change-password" onClick={handleChangePassword}>
          Cambiar Contraseña
        </button>
      </section>
  
      <section>
        <h2>Eliminar Cuenta</h2>
        <button
          className="btn-delete-account"
          onClick={handleDeleteAccount}
          disabled={isDeleting}
        >
          {isDeleting ? "Eliminando..." : "Eliminar Cuenta"}
        </button>
      </section>
  
      {statusMessage && (
        <p className="status success">{statusMessage}</p>
      )}
      {errorMessage && (
        <p className="status error">{errorMessage}</p>
      )}
    </div>
  );

};
