<?php
/**
 * Archivo: Controllers/UserController.php
 * Controlador para manejar las operaciones relacionadas con usuarios
 * Hereda de BaseController y utiliza UserModel para interactuar con la base de datos
 */

// Incluir dependencias
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../Models/UserModel.php';

/**
 * Clase UserController
 * Maneja las peticiones HTTP relacionadas con los usuarios
 */
class UserController extends BaseController {
    
    /**
     * Constructor de la clase
     * Inicializa el modelo de usuario
     */
    public function __construct() {
        $this->model = new UserModel();
    }
    
    /**
     * Maneja las peticiones HTTP entrantes
     * Procesa la peticion y enruta a los metodos correspondientes
     */
    public function handleRequest() {
        // Configuracion de cabeceras CORS
        header("Access-Control-Allow-Origin: *");  // Permitir solicitudes desde cualquier origen
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
        header("Access-Control-Allow-Credentials: true");

        // Manejo de peticiones OPTIONS (preflight)
        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            http_response_code(200);
            exit;
        }

        // Obtener y decodificar los datos JSON de la peticion
        $input = json_decode(file_get_contents('php://input'), true);

        // Extraer el controlador y metodo de la peticion
        $controller = $input['controller'] ?? null;
        $method = $input['method'] ?? null;

        // Validar que se hayan proporcionado controlador y metodo
        if (!$controller || !$method) {
            http_response_code(400);
            echo json_encode(['error' => 'Controlador o metodo no especificado en el cuerpo']);
            return;
        }

        // Verificar que el controlador sea 'User'
        if ($controller !== 'User') {
            http_response_code(400);
            echo json_encode(['error' => 'Controlador no valido']);
            return;
        }

        // Procesar metodos POST
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $data = $input['data'] ?? null; 
            
            // Crear un nuevo usuario
            if ($method === 'create') {
                if ($data && $this->model->create($data)) {
                    echo json_encode(['success' => true]);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'Error al crear el usuario']);
                }
            }
            
            // Iniciar sesion de usuario
            if ($method === 'login') {
                $this->model->login($data);  
            }
            
            // Obtener todos los usuarios
            if ($method === 'all') {
                $data = $this->model->getAll();
                echo json_encode($data);
            }
            
            // Eliminar un usuario por ID
            if ($method === 'delete' && isset($data['id'])) {
                $id = intval($data['id']);
                if ($this->model->delete($id)) {
                    echo json_encode(['success' => true]);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'Error al eliminar el usuario']);
                }
            }
            
            // Actualizar un usuario existente
            if ($method === 'update' && isset($data['id'])) {
                $id = intval($data['id']);
                if ($this->model->update($id, $data)) {
                    echo json_encode(['success' => true]);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'Error al actualizar el usuario']);
                }
            }
            
            // Obtener un usuario por ID
            if ($method === 'getUserByID' && isset($data['id'])) {
                $id = intval($data['id']);
                $user = $this->model->get($id);
                if ($user) {
                    echo json_encode($user);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'Error al obtener informacion del usuario']);
                }
            }
        }
    }
}
?>
