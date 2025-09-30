/**
 * Rutas para el manejo de mensajes
 * Este archivo centraliza la exportación de los controladores de mensajes
 * para ser utilizados en el enrutador principal
 */

// Importar controladores de mensajes
import { 
  crearMensajeHandler,          // Crea un nuevo mensaje
  obtenerMensajesHandler,        // Obtiene historial de mensajes
  obtenerUltimoMensajeHandler,   // Obtiene el último mensaje de una conversación
  marcarChatComoLeido,          // Marca mensajes como leídos
  obtenerAmigosConEstado        // Obtiene lista de amigos con estado de mensajes
} from "../controllers/mensajesController.js";

// Exportar controladores para ser utilizados en el enrutador principal
export { 
  crearMensajeHandler, 
  obtenerMensajesHandler, 
  obtenerUltimoMensajeHandler, 
  marcarChatComoLeido, 
  obtenerAmigosConEstado 
};
