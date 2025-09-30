<?php
/**
 * Archivo: Models/PublicacionesModel.php
 * Modelo para manejar las operaciones de base de datos relacionadas con publicaciones
 * Hereda de BaseModel y gestiona la logica de negocio para las publicaciones
 */

require_once "BaseModel.php";

/**
 * Clase PublicacionesModel
 * Gestiona las operaciones CRUD para la tabla de publicaciones
 */
class PublicacionesModel extends BaseModel {
    /** @var string $storageAccount Nombre de la cuenta de Azure Storage */
    private $storageAccount;
    
    /** @var string $containerName Nombre del contenedor de blobs */
    private $containerName;
    
    /** @var string $sasToken Token SAS para autenticacion con Azure */
    private $sasToken;

    /**
     * Constructor de la clase
     * Inicializa las propiedades y configura la conexion a Azure Blob Storage
     */
    public function __construct() {
        parent::__construct();
        $this->table = 'publicaciones';

        // Obtener configuracion de Azure Storage desde variables de entorno
        $this->storageAccount = getenv('AZURE_STORAGE_ACCOUNT') ?? '';
        $this->containerName = getenv('AZURE_STORAGE_CONTAINER') ?? '';
        $this->sasToken = getenv('AZURE_STORAGE_SAS_TOKEN') ?? '';
    }

    /**
     * Crea una nueva publicacion en la base de datos
     * @param array $data Datos de la publicacion (usuario_id, contenido, imagen opcional)
     * @return bool True si la publicacion se creo correctamente, False en caso contrario
     */
    public function create(array $data): bool {
        // Si la imagen viene en formato base64, guardarla en Azure Blob Storage
        if (isset($data['imagen']) && str_starts_with($data['imagen'], 'data:image/')) {
            $data['imagen'] = $this->guardarImagenBase64($data['imagen']);
        }

        // Preparar y ejecutar la consulta SQL
        $query = "INSERT INTO {$this->table} (usuario_id, contenido, imagen) VALUES (:usuario_id, :contenido, :imagen)";
        $stmt = $this->getConnection()->prepare($query);

        // Ejecutar la consulta con los parametros
        return $stmt->execute([
            'usuario_id' => $data['usuario_id'],
            'contenido'  => $data['contenido'],
            'imagen'     => $data['imagen'] ?? null
        ]);
    }

    /**
     * Guarda una imagen en formato base64 en Azure Blob Storage
     * @param string $base64 Imagen en formato base64
     * @return string URL de la imagen subida
     * @throws Exception Si hay un error al procesar la imagen
     */
    private function guardarImagenBase64(string $base64): string {
        // Extraer la extension de la imagen del string base64
        preg_match('/^data:image\/(\w+);base64,/', $base64, $type);
        $ext = $type[1] ?? 'jpg';
        
        // Limpiar el string base64
        $base64 = preg_replace('/^data:image\/\w+;base64,/', '', $base64);
        $base64 = str_replace(' ', '+', $base64);
        $data = base64_decode($base64);

        // Guardar temporalmente la imagen decodificada
        $tempFile = sys_get_temp_dir() . '/' . uniqid('pub_') . '.' . $ext;
        file_put_contents($tempFile, $data);

        // Generar un nombre unico para el blob
        $blobName = 'publicaciones/' . uniqid() . '.' . $ext;

        // Subir el archivo a Azure Blob Storage
        $url = $this->uploadToAzureBlob($this->storageAccount, $this->containerName, $blobName, $tempFile, $this->sasToken);

        // Eliminar el archivo temporal
        unlink($tempFile);

        return $url;
    }

    /**
     * Sube un archivo a Azure Blob Storage
     * @param string $storageAccount Nombre de la cuenta de almacenamiento
     * @param string $containerName Nombre del contenedor
     * @param string $blobName Nombre del blob
     * @param string $filePath Ruta local del archivo a subir
     * @param string $sasToken Token SAS para autenticacion
     * @return string URL del archivo subido
     * @throws Exception Si hay un error al subir el archivo
     */
    private function uploadToAzureBlob($storageAccount, $containerName, $blobName, $filePath, $sasToken) {
        // Construir la URL del blob
        $url = "https://{$storageAccount}.blob.core.windows.net/{$containerName}/{$blobName}?{$sasToken}";

        // Obtener informacion del archivo
        $fileSize = filesize($filePath);
        $fileHandle = fopen($filePath, 'r');

        // Configurar cabeceras para la peticion HTTP
        $headers = [
            'x-ms-blob-type: BlockBlob',
            'Content-Length: ' . $fileSize,
            'x-ms-version: 2020-10-02',
            'x-ms-date: ' . gmdate('D, d M Y H:i:s T')
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
        curl_close($ch);
        fclose($fileHandle);

        // Verificar el codigo de estado de la respuesta
        if ($statusCode == 201) {
            return "https://{$storageAccount}.blob.core.windows.net/{$containerName}/{$blobName}";
        } else {
            throw new Exception("Error subiendo archivo a Azure Blob: HTTP $statusCode");
        }
    }

    /**
     * Actualiza una publicacion existente
     * @param int $id ID de la publicacion a actualizar
     * @param array $data Nuevos datos de la publicacion
     * @return bool True si la actualizacion fue exitosa, False en caso contrario
     */
    public function update(int $id, array $data): bool {
        // Construir la consulta SQL para actualizar
        $query = "UPDATE {$this->table} SET 
            usuario_id = :usuario_id,
            contenido  = :contenido,
            imagen     = :imagen 
            WHERE id = $id";
            
        // Preparar y ejecutar la consulta
        $stmt = $this->getConnection()->prepare($query);
        return $stmt->execute([
            'usuario_id' => $data['usuario_id'],
            'contenido'  => $data['contenido'],
            'imagen'     => $data['imagen']
        ]);
    }

    /**
     * Obtiene todas las publicaciones con sus respectivos likes y comentarios
     * @return array Lista de publicaciones con informacion adicional
     */
    public function getAll() {
        $pdo = $this->getConnection();

        // Obtener todas las publicaciones
        $stmt = $pdo->query("SELECT * FROM publicaciones ORDER BY creado_en DESC");
        $publicaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Obtener todos los likes con informacion de los usuarios
        $likesStmt = $pdo->query("
            SELECT l.*, u.nombre_usuario, u.foto_perfil 
            FROM likes l
            JOIN usuarios u ON l.usuario_id = u.id
        ");
        $likes = $likesStmt->fetchAll(PDO::FETCH_ASSOC);

        // Obtener todos los comentarios con informacion de los usuarios
        $comentariosStmt = $pdo->query("
            SELECT c.*, u.nombre_usuario, u.foto_perfil 
            FROM comentarios c
            JOIN usuarios u ON c.usuario_id = u.id
            ORDER BY c.creado_en ASC
        ");
        $comentarios = $comentariosStmt->fetchAll(PDO::FETCH_ASSOC);

        // Asociar likes y comentarios a cada publicacion
        foreach ($publicaciones as &$pub) {
            // Filtrar y asignar likes
            $pub['likes'] = array_values(array_filter($likes, function ($like) use ($pub) {
                return $like['publicacion_id'] == $pub['id'];
            }));
            $pub['totalLikes'] = count($pub['likes']);

            // Filtrar y asignar comentarios
            $pub['comentarios'] = array_values(array_filter($comentarios, function ($comentario) use ($pub) {
                return $comentario['publicacion_id'] == $pub['id'];
            }));
            $pub['totalComentarios'] = count($pub['comentarios']);
        }

        return $publicaciones;
    }

    /**
     * Obtiene las publicaciones de los amigos de un usuario
     * @param int $usuarioId ID del usuario cuyos amigos se consultaran
     * @return array Lista de publicaciones de amigos con informacion adicional
     */
    public function getPublicacionesDeAmigos($usuarioId) {
        $pdo = $this->getConnection();

        // Consulta para obtener publicaciones de amigos
        $sql = "
            SELECT p.*, u.nombre_usuario, u.foto_perfil
            FROM publicaciones p
            JOIN usuarios u ON p.usuario_id = u.id
            WHERE p.usuario_id IN (
                -- Subconsulta para obtener los IDs de los amigos
                SELECT 
                    CASE
                        WHEN usuario1_id = :usuarioId THEN usuario2_id
                        ELSE usuario1_id
                    END AS amigo_id
                FROM amigos
                WHERE (usuario1_id = :usuarioId OR usuario2_id = :usuarioId)
                AND estado = 'aceptada'  -- Solo incluir amistades aceptadas
            )
            ORDER BY p.creado_en DESC
        ";

        // Ejecutar consulta de publicaciones
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['usuarioId' => $usuarioId]);
        $publicaciones = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Si no hay publicaciones, retornar array vacio
        $publicacionIds = array_column($publicaciones, 'id');
        if (empty($publicacionIds)) {
            return [];
        }

        // Crear placeholders para la consulta IN
        $placeholders = implode(',', array_fill(0, count($publicacionIds), '?'));

        // Consulta para obtener likes de las publicaciones
        $likesSql = "
            SELECT l.*, u.nombre_usuario, u.foto_perfil
            FROM likes l
            JOIN usuarios u ON l.usuario_id = u.id
            WHERE l.publicacion_id IN ($placeholders)
        ";
        $likesStmt = $pdo->prepare($likesSql);
        $likesStmt->execute($publicacionIds);
        $likes = $likesStmt->fetchAll(PDO::FETCH_ASSOC);

        // Consulta para obtener comentarios de las publicaciones
        $comentariosSql = "
            SELECT c.*, u.nombre_usuario, u.foto_perfil
            FROM comentarios c
            JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.publicacion_id IN ($placeholders)
            ORDER BY c.creado_en ASC
        ";
        $comentariosStmt = $pdo->prepare($comentariosSql);
        $comentariosStmt->execute($publicacionIds);
        $comentarios = $comentariosStmt->fetchAll(PDO::FETCH_ASSOC);

        // Asociar likes y comentarios a cada publicacion
        foreach ($publicaciones as &$pub) {
            // Filtrar y asignar likes
            $pub['likes'] = array_values(array_filter($likes, fn($like) => $like['publicacion_id'] == $pub['id']));
            $pub['totalLikes'] = count($pub['likes']);

            // Filtrar y asignar comentarios
            $pub['comentarios'] = array_values(array_filter($comentarios, fn($comentario) => $comentario['publicacion_id'] == $pub['id']));
            $pub['totalComentarios'] = count($pub['comentarios']);
        }

        return $publicaciones;
    }

    /**
     * Obtiene todas las publicaciones de un usuario especifico
     * @param int $userID ID del usuario cuyas publicaciones se desean obtener
     * @return array Lista de publicaciones del usuario
     */
    public function getUserPublications($userID) {
        $pdo = $this->getConnection();
        
        // Consulta para obtener las publicaciones del usuario ordenadas por fecha descendente
        $stmt = $pdo->prepare("SELECT * FROM publicaciones WHERE usuario_id = :userID ORDER BY creado_en DESC");
        $stmt->execute(['userID' => $userID]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

}
?>
