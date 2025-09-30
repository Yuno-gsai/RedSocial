<?php
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
if ($controller && $method) {
    // Construir la ruta al archivo del controlador
    $controllerFile = __DIR__ . "/Routes/{$controller}.php";
    
    // Verificar si el archivo del controlador existe
    if (file_exists($controllerFile)) {
        // Incluir el archivo del controlador
        require_once $controllerFile;  
    } else {
        // Devolver error 404 si el controlador no existe
        http_response_code(404);
        echo json_encode(['error' => 'Ruta no encontrada']);
    }
} else {
    // Devolver error 400 si faltan parametros requeridos
    http_response_code(400);
    echo json_encode(['error' => 'Controlador o metodo no especificado en el cuerpo']);
}
?>
