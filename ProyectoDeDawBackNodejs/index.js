// Importación de dependencias principales
import express from "express";         // Framework web para Node.js
import cors from "cors";                // Middleware para habilitar CORS
import logger from "morgan";            // Middleware para el registro de solicitudes HTTP
import { Server } from "socket.io";     // Librería para WebSockets
import { createServer } from "http";    // Módulo HTTP nativo de Node.js
import dotenv from "dotenv";            // Para cargar variables de entorno

// Cargar variables de entorno desde el archivo .env
dotenv.config();

// Configuración del puerto (usa el puerto de las variables de entorno o 5000 por defecto)
const port = process.env.PORT || 5000;

// Crear aplicación Express
const app = express();

// Configuración de CORS (Cross-Origin Resource Sharing)
// Permite solicitudes desde los orígenes especificados
app.use(
  cors({
    origin: [
      "https://calm-sky-07d7c2f1e.6.azurestaticapps.net", // Producción
      "http://localhost:5173"                             // Desarrollo local
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Métodos HTTP permitidos
    allowedHeaders: ["Content-Type", "Authorization"],     // Cabeceras permitidas
  })
);

// Middleware para el registro de solicitudes HTTP en modo desarrollo
app.use(logger("dev"));

// Middleware para parsear el cuerpo de las solicitudes a formato JSON
app.use(express.json());

/**
 * Ruta principal que maneja todas las solicitudes de la API
 * Utiliza importación dinámica para cargar controladores bajo demanda
 */
app.post("/", (req, res) => {
  // Extraer nombre del controlador y método del cuerpo de la solicitud
  const { controller, method } = req.body;

  // Validar que se hayan proporcionado controlador y método
  if (!controller || !method) {
    return res.status(400).json({ error: "Controlador o método no especificado en el cuerpo" });
  }

  // Importar dinámicamente el controlador solicitado
  import(`./controllers/${controller}Controller.js`)
    .then((controllerModule) => {
      // Obtener la función del controlador
      const controllerFunc = controllerModule[method];

      // Si la función existe, ejecutarla con la solicitud y respuesta
      if (controllerFunc) {
        controllerFunc(req, res);
      } else {
        // Si el método no existe en el controlador
        res.status(404).json({ error: "Método no encontrado" });
      }
    })
    .catch((error) => {
      // Manejar errores de carga del controlador
      console.error("Error al cargar el controlador:", error);
      res.status(404).json({ error: "Controlador no encontrado" });
    });
});

// Crear servidor HTTP
const server = createServer(app);

// Configurar Socket.IO para comunicación en tiempo real
const io = new Server(server, {
  cors: {
    origin: [
      "https://calm-sky-07d7c2f1e.6.azurestaticapps.net", // Producción
      "http://localhost:5173",                            // Desarrollo local
    ],
    methods: ["GET", "POST"],  // Métodos HTTP permitidos para WebSockets
  },
});

// Hacer que la instancia de io esté disponible en toda la aplicación a través de app
app.set("io", io);

// Manejar conexiones de Socket.IO
io.on("connection", (socket) => {
  console.log("Usuario conectado (socket):", socket.id);

  // Escuchar eventos de mensaje y retransmitirlos a todos los clientes
  socket.on("message", (data) => {
    io.emit("message", data);
  });

  // Manejar desconexión de clientes
  socket.on("disconnect", () => {
    console.log("Usuario desconectado (socket):", socket.id);
  });
});

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
}); 