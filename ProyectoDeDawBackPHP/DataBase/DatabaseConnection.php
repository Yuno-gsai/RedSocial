<?php
/**
 * Archivo: DataBase/DatabaseConnection.php
 * Clase para manejar la conexion a la base de datos MySQL
 * Utiliza PDO para una conexion segura y manejo de errores
 */

/**
 * Clase DatabaseConnection
 * Gestiona la conexion a la base de datos y ejecucion de consultas
 */
class DatabaseConnection {
    /**
     * @var PDO Instancia de la conexion PDO
     */
    private $conn;

    /**
     * Constructor de la clase
     * Establece la conexion con la base de datos y crea la base de datos si no existe
     * @throws Exception Si hay un error en la conexion
     */
    public function __construct() {
        // Obtener configuracion de las variables de entorno o usar valores por defecto
        $host       = getenv('DB_HOST') ;
        $port       = getenv('DB_PORT') ;
        $username   = getenv('DB_USERNAME') ;
        $password   = getenv('DB_PASSWORD') ;
        $database   = getenv('DB_DATABASE') ;
        $sslCaPath  = getenv('DB_SSL_CA_PATH') ;

        try {
            // Configuracion de opciones de PDO
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,  // Lanzar excepciones en errores
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",  // Configurar juego de caracteres
            ];

            // Configurar SSL si existe el certificado
            if ($sslCaPath && file_exists($sslCaPath)) {
                $options[PDO::MYSQL_ATTR_SSL_CA] = $sslCaPath;
            }
            
            // Crear DSN (Data Source Name)
            $dsn = "mysql:host=$host;port=$port;charset=utf8mb4";

            // Crear instancia de PDO
            $this->conn = new PDO($dsn, $username, $password, $options);

            // Verificar si la base de datos existe
            $stmt = $this->conn->prepare("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?");
            $stmt->execute([$database]);
            $exists = $stmt->fetch(PDO::FETCH_ASSOC);

            // Crear base de datos y tablas si no existen
            if (!$exists) {
                $this->createDatabaseAndTables($database);
            }
            
            // Seleccionar la base de datos
            $this->conn->exec("USE `$database`");

        } catch(PDOException $e) {
            throw new Exception("Error de conexión: " . $e->getMessage());
        }
    }

    /**
     * Crea la base de datos y las tablas necesarias
     * @param string $database Nombre de la base de datos
     * @throws Exception Si hay un error al crear la base de datos
     */
    private function createDatabaseAndTables(string $database) {
        try {
            // Crear la base de datos si no existe
            $this->conn->exec("CREATE DATABASE IF NOT EXISTS `$database` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $this->conn->exec("USE `$database`");

            // Ejecutar script SQL para crear las tablas
            $sql = file_get_contents(__DIR__ . '/DataBase.sql');
            $this->conn->exec($sql);
        } catch(PDOException $e) {
            throw new Exception("Error al crear la base de datos: " . $e->getMessage());
        }
    }

    /**
     * Obtiene la conexion PDO
     * @return PDO Instancia de la conexion PDO
     */
    public function getConnection() {
        return $this->conn;
    }

    /**
     * Ejecuta una consulta SQL
     * @param string $query Consulta SQL a ejecutar
     * @return PDOStatement Objeto PDOStatement con el resultado
     * @throws Exception Si hay un error al ejecutar la consulta
     */
    public function ExecuteQuery(string $query) {
        try {
            $conn = $this->getConnection();
            $stmt = $conn->prepare($query);
            $stmt->execute();
            return $stmt;
        } catch (PDOException $e) {
            throw new Exception("Error al ejecutar la consulta: " . $e->getMessage());
        }
    }

    /**
     * Destructor de la clase
     * Cierra la conexion a la base de datos
     */
    public function __destruct() {
        $this->conn = null;
    }
}
?>
