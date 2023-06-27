<?php

require_once __DIR__. '/../../vendor/autoload.php'; // Include the Composer autoloader

// Load the environment file
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__.'/../../');
$dotenv->load();

ini_set('session.gc_maxlifetime', $_ENV['SESSION_TIMEOUT']);
session_set_cookie_params($_ENV['SESSION_TIMEOUT']);
session_start();

// Check if the userId is not present in the session
if (!isset($_SESSION['userId'])) {
    // Return JSON response with authentication error message
    $response = array(
        'success' => false,
        'message' => 'Authentication error'
    );

    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

// Check the role ID if provided as a parameter
if (isset($allowedRoleIds)) {

    // Convert the string to an integer
    $roleId = intval($_SESSION['roleId']);

    // Check if the user's role ID is in the role array
    if (!in_array($roleId, $allowedRoleIds)) {
        // Return JSON response with access denied message
        $response = array(
            'success' => false,
            'message' => 'Access denied'
        );

        header('Content-Type: application/json');
        echo json_encode($response);
        exit();
    }
}
