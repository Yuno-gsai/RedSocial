import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";

// Cargar variables de entorno desde el archivo .env
dotenv.config();

/**
 * Pool de conexiones a la base de datos MySQL
 * Configurado para manejar múltiples conexiones de manera eficiente
 * Utiliza SSL para conexiones seguras
 */
const pool = mysql.createPool({
  // Configuración de conexión a la base de datos usando variables de entorno
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  ssl: {
    ca: fs.readFileSync(process.env.DB_SSL_CA_PATH),
    rejectUnauthorized: false,
  },
  // Configuración del pool de conexiones
  waitForConnections: true,   // Esperar conexiones si no hay disponibles
  connectionLimit: 10,        // Número máximo de conexiones simultáneas
  queueLimit: 0,              // Límite de solicitudes en cola (0 = sin límite)
});

// Exportar el pool de conexiones para ser utilizado en otros módulos
export default pool;
