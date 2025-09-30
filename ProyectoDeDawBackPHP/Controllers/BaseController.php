<?php
/**
 * Clase BaseController
 * Controlador base del que heredan todos los demas controladores
 * Maneja las peticiones HTTP basicas (CRUD) y la configuracion CORS
 */
abstract class BaseController {
    /**
     * @var object Instancia del modelo asociado al controlador
     */
    protected $model;

    /**
     * Maneja las peticiones HTTP entrantes
     * Procesa la peticion y enruta a los metodos correspondientes
     */
    public function handleRequest() {
        // Configuracion de cabeceras CORS para permitir peticiones desde cualquier origen
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

        // Procesar metodos POST
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $data = $input['data'] ?? null;

            // Crear un nuevo registro
            if ($method === 'create') {
                if ($data && $this->model->create($data)) {
                    echo json_encode(['success' => true]);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'Error al crear']);
                }
            }
            
            // Obtener todos los registros
            if ($method === 'all') {
                $data = $this->model->getAll();
                echo json_encode($data);
            }
            
            // Eliminar un registro
            if ($method === 'delete' && isset($data['id'])) {
                $id = intval($data['id']);
                if ($this->model->delete($id)) {
                    echo json_encode(['success' => true]);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'Error al eliminar']);
                }
            }
            
            // Actualizar un registro
            if ($method === 'update' && isset($data['id'])) {
                $id = intval($data['id']);
                if ($this->model->update($id, $data)) {
                    echo json_encode(['success' => true]);
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'Error al actualizar']);
                }
            }
        }
    }
}
?>
