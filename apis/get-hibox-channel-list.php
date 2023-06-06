<?php

$allowedRoleIds = [1,2];
// Include the authentication file
require_once 'common/authentication.php';
// Include the soap file
require_once 'common/soap.php';

require_once __DIR__. '/../vendor/autoload.php'; // Include the Composer autoloader

// Load the environment file
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__.'/../');
$dotenv->load();


// Create the response object
$response = array(
    'success' => false,
    'message' => ''
  );
try {
    // Create an empty array to store the result
    $hiboxRes = callSoap('getAllChannels', []);

    if($hiboxRes['success']) {
        $response['success'] = true;
        $response['data']['channels'] = $hiboxRes['data'];
        $response['data']['url'] = $_ENV['HIBOX_BASE_URL'];
    } else {
        $response['success'] = true;
        $response['message'] = $hiboxRes['message'];
    }
} catch (Exception $e) {
    // Handle the exception and return an error message
    $response['success'] = false;
    $response['message'] = $e->getMessage();
}

// Convert the response array to JSON
$jsonResponse = json_encode($response);

// Send the JSON response
header('Content-Type: application/json');
echo $jsonResponse;
