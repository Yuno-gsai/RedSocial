<?php
/**
 * Archivo: Models/BaseModel.php
 * Clase base para todos los modelos de la aplicacion
 * Proporciona funcionalidades CRUD basicas
 */

// Incluir la clase de conexion a la base de datos
require_once  __DIR__ . '/../DataBase/DatabaseConnection.php';

/**
 * Clase BaseModel
 * Clase abstracta que sirve como base para todos los modelos de la aplicacion
 * Extiende de DatabaseConnection para tener acceso a la conexion PDO
 */
abstract class BaseModel extends DatabaseConnection{  
    /**
     * @var string Nombre de la tabla en la base de datos
     * Debe ser definido en las clases hijas
     */
    protected $table;

    /**
     * Constructor de la clase
     * Inicializa la conexion a la base de datos llamando al constructor del padre
     */
    public function __construct() {
        parent::__construct();
    }
    
    /**
     * Obtiene todos los registros de la tabla
     * @return array Arreglo asociativo con todos los registros
     */
    public function getAll() {
        $query = "SELECT * FROM {$this->table}";
        return $this->ExecuteQuery($query)->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Obtiene un registro por su ID
     * @param int $id ID del registro a buscar
     * @return array|false Arreglo asociativo con los datos del registro o false si no se encuentra
     */
    public function get($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = $id";
        return $this->ExecuteQuery($query)->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Elimina un registro por su ID
     * @param int $id ID del registro a eliminar
     * @return bool True si se elimino correctamente, False en caso contrario
     */
    public function delete($id) {
        $query = "DELETE FROM $this->table WHERE id = $id";
        return $this->ExecuteQuery($query);
    }
    
    // Nota: Los metodos create() y update() deben ser implementados en las clases hijas
    // ya que la estructura de cada tabla puede variar
}
?>