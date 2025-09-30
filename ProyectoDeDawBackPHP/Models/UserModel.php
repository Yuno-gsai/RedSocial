<?php
// Incluir la clase base de la que hereda
require_once 'BaseModel.php';

/**
 * Clase UserModel
 * Maneja todas las operaciones relacionadas con los usuarios en la base de datos
 * Incluye autenticacion, registro y gestion de perfiles
 */
class UserModel extends BaseModel {
    // Propiedades para el almacenamiento en Azure Blob
    private $storageAccount;    // Nombre de la cuenta de almacenamiento
    private $containerName;     // Nombre del contenedor en Azure
    private $sasToken;          // Token de seguridad para Azure

    /**
     * Constructor de la clase
     * Inicializa la conexion a la base de datos y configura las propiedades de Azure
     */
    public function __construct() {
        parent::__construct();
        $this->table = 'usuarios';  // Nombre de la tabla en la base de datos

        // Obtener configuracion de Azure desde variables de entorno
        $this->storageAccount = getenv('AZURE_STORAGE_ACCOUNT') ?? '';
        $this->containerName = getenv('AZURE_STORAGE_CONTAINER') ?? '';
        $this->sasToken = getenv('AZURE_STORAGE_SAS_TOKEN') ?? '';
    }

    /**
     * Crea un nuevo usuario en la base de datos
     * @param array $data Datos del usuario a crear
     * @return bool True si se creo correctamente, False en caso contrario
     */
    public function create(array $data): bool {
        // Hashear la contrasena antes de guardarla
        if (isset($data['contrasena'])) {
            $data['contrasena'] = password_hash($data['contrasena'], PASSWORD_DEFAULT);
        }
    
        // Preparar y ejecutar la consulta SQL
        $query = "INSERT INTO {$this->table} (nombre_usuario, correo, contrasena) 
                VALUES (:nombre_usuario, :correo, :contrasena)";
        $stmt = $this->getConnection()->prepare($query);
        return $stmt->execute($data);
    }

    /**
     * Actualiza los datos de un usuario existente
     * @param int $id ID del usuario a actualizar
     * @param array $data Nuevos datos del usuario
     * @return bool True si la actualizacion fue exitosa, False en caso contrario
     */
    public function update(int $id, array $data) {
        $data['id'] = $id;  // Asegurar que el ID este en los datos
    
        // Hashear la nueva contrasena si se proporciona
        if (isset($data['contrasena'])) {
            $data['contrasena'] = password_hash($data['contrasena'], PASSWORD_DEFAULT);
        }
    
        // Procesar imagen de perfil si se proporciona en formato base64
        if (isset($data['foto_perfil']) && str_starts_with($data['foto_perfil'], 'data:image/')) {
            $data['foto_perfil'] = $this->guardarImagenBase64($data['foto_perfil']);
        }
    
        // Definir campos permitidos para actualizar
        $allowedFields = ['nombre_usuario', 'correo', 'contrasena', 'foto_perfil', 'biografia'];
        $setClauses = [];
    
        // Construir clausulas SET dinamicamente solo para los campos proporcionados
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $setClauses[] = "$field = :$field";
            }
        }
    
        // Validar que haya campos para actualizar
        if (empty($setClauses)) {
            return false;
        }
    
        // Construir y ejecutar la consulta SQL
        $query = "UPDATE {$this->table} SET " . implode(', ', $setClauses) . " WHERE id = :id";
    
        try {
            $stmt = $this->getConnection()->prepare($query);
            return $stmt->execute($data);
        } catch (PDOException $e) {
            // Registrar error en el log
            error_log("Error en UserModel->update: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Guarda una imagen en formato base64 en el almacenamiento de Azure
     * @param string $base64 Imagen en formato base64
     * @return string URL de la imagen subida
     */
    private function guardarImagenBase64(string $base64): string {
        // Extraer la extension del archivo del string base64
        preg_match('/^data:image\/(\w+);base64,/', $base64, $type);
        $ext = $type[1]; 
        
        // Limpiar el string base64
        $base64 = preg_replace('/^data:image\/\w+;base64,/', '', $base64);
        $base64 = str_replace(' ', '+', $base64);
        
        // Decodificar la imagen
        $data = base64_decode($base64);
    
        // Guardar temporalmente la imagen
        $tempFile = sys_get_temp_dir() . '/' . uniqid('img_') . '.' . $ext;
        file_put_contents($tempFile, $data);
    
        // Generar un nombre unico para el archivo en Azure
        $blobName = 'usuarios/' . uniqid() . '.' . $ext;
    
        // Subir a Azure Blob Storage
        $url = $this->uploadToAzureBlob(
            $this->storageAccount, 
            $this->containerName, 
            $blobName, 
            $tempFile, 
            $this->sasToken
        );
    
        // Eliminar el archivo temporal
        unlink($tempFile);
    
        return $url;  // Devolver la URL de la imagen subida
    }
    
    /**
     * Sube un archivo a Azure Blob Storage
     * @param string $storageAccount Nombre de la cuenta de almacenamiento
     * @param string $containerName Nombre del contenedor
     * @param string $blobName Nombre del blob
     * @param string $filePath Ruta local del archivo a subir
     * @param string $sasToken Token de firma de acceso compartido
     * @return string URL del archivo subido
     * @throws Exception Si ocurre un error durante la subida
     */
    private function uploadToAzureBlob($storageAccount, $containerName, $blobName, $filePath, $sasToken) {
        // Construir la URL completa para la subida
        $url = "https://{$storageAccount}.blob.core.windows.net/{$containerName}/{$blobName}?{$sasToken}";

        // Obtener informacion del archivo
        $fileSize = filesize($filePath);
        $fileHandle = fopen($filePath, 'r');
    
        // Configurar cabeceras para la peticion HTTP
        $headers = [
            'x-ms-blob-type: BlockBlob',          // Tipo de blob
            'Content-Length: ' . $fileSize,        // Tamaño del archivo
            'x-ms-version: 2020-10-02',           // Version de la API de Azure
            'x-ms-date: ' . gmdate('D, d M Y H:i:s T')  // Fecha actual en formato GMT
        ];
    
        // Configurar y ejecutar la peticion cURL
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_PUT, true);
        curl_setopt($ch, CURLOPT_INFILE, $fileHandle);
        curl_setopt($ch, CURLOPT_INFILESIZE, $fileSize);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
        // Ejecutar la peticion y obtener la respuesta
        $response = curl_exec($ch);
        $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
        // Cerrar recursos
        curl_close($ch);
        fclose($fileHandle);
    
        // Verificar el codigo de estado HTTP
        if ($statusCode == 201) {
            // Devolver la URL publica del archivo
            return "https://{$storageAccount}.blob.core.windows.net/{$containerName}/{$blobName}";
        } else {
            // Lanzar excepcion en caso de error
            throw new Exception("Error subiendo archivo a Azure Blob: HTTP $statusCode");
        }
    }

    /**
     * Busca un usuario por su direccion de correo electronico
     * @param string $email Correo electronico del usuario a buscar
     * @return array|false Datos del usuario o false si no se encuentra
     */
    public function getByEmail(string $email) {
        // Preparar y ejecutar consulta SQL
        $query = "SELECT * FROM {$this->table} WHERE correo = :correo LIMIT 1";
        $stmt = $this->getConnection()->prepare($query);
        $stmt->execute(['correo' => $email]);
        
        // Devolver el primer resultado como array asociativo
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Autentica a un usuario
     * @param array $data Datos de inicio de sesion (correo y contrasena)
     * @return void Envia una respuesta JSON con el resultado
     */
    public function login($data) {
        // Verificar si los datos son un JSON valido
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);  // Bad Request
            echo json_encode([
                'success' => false,
                'message' => 'JSON invalido'
            ]);
            return;
        }
    
        // Validar campos requeridos
        if (empty($data['correo']) || empty($data['contrasena'])) {
            http_response_code(400);  // Bad Request
            echo json_encode([
                'success' => false,
                'message' => 'Correo y contrasena requeridos'
            ]);
            return;
        }
    
        // Buscar usuario por correo
        $user = $this->getByEmail($data['correo']);
        
        // Verificar si el usuario existe
        if (!$user) {
            http_response_code(401);  // Unauthorized
            echo json_encode([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ]);
            return;
        }
    
        // Verificar contrasena
        if (password_verify($data['contrasena'], $user['contrasena'])) {
            // Eliminar la contrasena del array antes de enviar la respuesta
            unset($user['contrasena']);
            
            // Inicio de sesion exitoso
            echo json_encode([
                'success' => true,
                'user' => $user
            ]);
        } else {
            // Contrasena incorrecta
            http_response_code(401);  // Unauthorized
            echo json_encode([
                'success' => false,
                'message' => 'Contrasena incorrecta'
            ]);
        }
    }
}
