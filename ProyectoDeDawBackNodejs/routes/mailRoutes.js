/**
 * Rutas para el manejo de correos electrónicos
 * Este archivo centraliza la exportación de los controladores de correo
 * para ser utilizados en el enrutador principal
 */

// Importar controladores de correo
import { 
  sendWelcomeEmail  // Controlador para enviar correo de bienvenida
} from "../controllers/mailController.js";

// Exportar controladores para ser utilizados en el enrutador principal
export { 
  sendWelcomeEmail 
};
