<?php
/**
 * Archivo: Controllers/PublicacionesController.php
 * Controlador para manejar las operaciones relacionadas con publicaciones
 * Hereda de BaseController y utiliza PublicacionesModel para interactuar con la base de datos
 */

// Incluir dependencias
require_once "BaseController.php";
require_once __DIR__ . '/../Models/PublicacionesModel.php';

/**
 * Clase PublicacionesController
 * Maneja las peticiones HTTP relacionadas con las publicaciones
 */
class PublicacionesController extends BaseController {

    /**
     * Constructor de la clase
     * Inicializa el modelo de publicaciones
     */
    public function __construct() {
        $this->model = new PublicacionesModel();
    }

    /**
     * Maneja las peticiones HTTP entrantes
     * Procesa la peticion y enruta a los metodos correspondientes
     */
    public function handleRequest() {
        // Configuracion de cabeceras CORS
        header("Access-Control-Allow-Origin: *");
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

        // Verificar que el controlador sea 'Publications'
        if ($controller !== 'Publications') {
            http_response_code(400);
            echo json_encode(['error' => 'Controlador no valido']);
            return;
        }

        // Procesar metodos POST
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $data = $input['data'] ?? null; 
            
            // Crear una nueva publicacion
            if ($method === 'create') {
                if ($data && $this->model->create($data)) {
                    echo json_encode(['success' => true]);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'Error al crear la publicacion']);
                }
            }
            
            // Obtener todas las publicaciones
            if ($method === 'all') {
                $data = $this->model->getAll();
                echo json_encode($data);
            }

            // Obtener publicaciones de amigos
            if ($method === 'amigos' && isset($data['usuario_id'])) {
                $usuarioId = $data['usuario_id']; 
                $data = $this->model->getPublicacionesDeAmigos($usuarioId);
                echo json_encode($data);
            }
            
            // Actualizar una publicacion existente
            if ($method === 'update' && isset($data['id'])) {
                $id = intval($data['id']);
                if ($this->model->update($id, $data)) {
                    echo json_encode(['success' => true]);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'Error al actualizar la publicacion']);
                }
            }

            // Eliminar una publicacion
            if ($method === 'delete' && isset($data['id'])) {
                $id = intval($data['id']);
                if ($this->model->delete($id)) {
                    echo json_encode(['success' => true]);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'Error al eliminar la publicacion']);
                }
            }
            
            // Obtener publicaciones por ID de usuario
            if ($method === 'GetPublicationsByUserID' && isset($data['usuario_id'])) {
                $usuarioId = $data['usuario_id']; 
                $data = $this->model->getUserPublications($usuarioId);
                echo json_encode($data);
            }
        }
    }
}
?>
