<?php
/**
 * Archivo: Routes/User.php
 * Punto de entrada para las rutas relacionadas con usuarios
 * Este archivo se encarga de inicializar el controlador de usuarios
 * y manejar las peticiones entrantes
 */

// Incluir el controlador de usuarios
require_once __DIR__ . '/../Controllers/UserController.php';

// Crear una instancia del controlador de usuarios
$controller = new UserController();

// Procesar la peticion HTTP entrante
$controller->handleRequest();
?>