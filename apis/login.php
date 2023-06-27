<?php

require_once __DIR__. '/../vendor/autoload.php'; // Include the Composer autoloader

// Load the environment file
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__.'/../');
$dotenv->load();

ini_set('session.gc_maxlifetime', $_ENV['SESSION_TIMEOUT']);
session_set_cookie_params($_ENV['SESSION_TIMEOUT']);
session_start();
// Include the database connection file
require_once 'common/db_connection.php';
require_once 'common/logger.php';

// Retrieve the raw POST data
$jsonData = file_get_contents('php://input');

// Create the response object
$response = array(
    'success' => false,
    'message' => ''
  );

// Check if any data was received
if (!empty($jsonData)) {
    // Decode the JSON data
    $data = json_decode($jsonData, true);

    // Check if JSON decoding was successful
    if ($data !== null && isset($data['username']) && isset($data['password'])) {
        // Form submitted, perform authentication
        $username = $data['username'];
        $password = md5($data['password']); // Convert the submitted password to MD5 format

        $query = "SELECT u.id, u.username, u.name, u.usersRoleId as roleId, ur.description as role FROM users u LEFT JOIN usersRoles ur ON ur.id = u.usersRoleId  WHERE u.username = '".$username."' AND u.password = '".$password."' AND u.enabled = 1";

        // Execute the query
        $result = $conn->query($query);

        $resUser = $result->fetch_assoc();

        // Check if the query was successful
        if ($resUser) {
            $response['success'] = true;
            // Query executed successfully
            $response['message'] = "Logged in sucesssully";
            $response['data'] = $resUser;
            $_SESSION['roleId'] = $response['data']['roleId'];
            $_SESSION['userId'] = $response['data']['id'];
            $_SESSION['userFullName'] = $response['data']['name'];
            $_SESSION['role'] = $response['data']['role'];
            // Update last access datetime
            $conn->query("UPDATE users SET lastAccess = NOW() WHERE id = ". $response['data']['id']);
            add_log($conn, 'logged in');

        } else {
            $response['success'] = false;
            $response['message'] = "Please check your username or password";
        }
    } else {
        // JSON decoding failed
        $response['success'] = false;
        $response['message'] = "Please enter both username and password";
    }

    // Close the database connection
    $conn->close();
} else {
    // No data received
    $response['success'] = false;
    $response['message'] = "No data received.";
}

// Convert the response array to JSON
$jsonResponse = json_encode($response);
// Send the JSON response
header('Content-Type: application/json');
echo $jsonResponse;
