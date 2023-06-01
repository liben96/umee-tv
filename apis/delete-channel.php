<?php

$allowedRoleIds = [1];
// Include the database connection file
require_once 'common/authentication.php';
// Include the database connection file
require_once 'common/db_connection.php';
// Include the database logger file
require_once 'common/logger.php';

// Create the response object
$response = array(
    'success' => false,
    'message' => ''
  );

try {
    // Retrieve the raw POST data
    $jsonData = file_get_contents('php://input');

    // Check if any data was received
    if (!empty($jsonData)) {
        // Decode the JSON data
        $data = json_decode($jsonData, true);

        // Check if JSON decoding was successful
        if ($data !== null && isset($data['id']) && isset($data['name']) && isset($data['channelName'])) {
            // Your SQL query
            $query = "UPDATE channel SET deleted = 1 WHERE id = ". $data['id'];

            // Execute the query
            $result = $conn->query($query);

            // Check if the query was successful
            if ($result) {
                add_log($conn, "deleted channel {$data['name']} - {$data['channelName']} (#{$data['id']})");
                $response['success'] = true;
                $response['message'] = 'Channel deleted sucessfully';
            } else {
                // Query execution failed
                $response['message'] = "Error executing the query: " . $conn->error;
            }
        } else {
            // Query execution failed
            $response['message'] = "No data received.";
        }

        // Close the database connection
        $conn->close();
    } else {
        // No data received
        $response['success'] = false;
        $response['message'] = "No data received.";
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
