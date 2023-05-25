<?php

$allowedRoleIds = [1];
// Include the database connection file
require_once 'common/authentication.php';
// Include the database connection file
require_once 'common/db_connection.php';

// Create the response object
$response = array(
    'success' => false,
    'message' => ''
  );

try {
    // Read the request body
    $requestBody = file_get_contents('php://input');
    $data = json_decode($requestBody, true);

    // Check if the number field exists in the database
    $number = $data['number'];

    // Your SQL query
    $query = "SELECT COUNT(*) as count FROM channel WHERE name = '$number'";

    // Execute the query
    $result = $conn->query($query);

    // Check if the query was successful
    if ($result) {
        $row = mysqli_fetch_assoc($result);
        $count = $row['count'];

        $response['success'] = true;
        $response['message'] = $count > 0 ? "This number already exist" : "";
        $response['data'] = ['exist' => $count > 0 ? true : false];
        ;
    } else {
        // Query execution failed
        $response['message'] = "Error executing the query: " . $conn->error;
    }
} catch (Exception $e) {
    // Handle the exception and return an error message
    $response['success'] = false;
    $response['message'] = $e->getMessage();
}


// Close the database connection
$conn->close();

// Convert the response array to JSON
$jsonResponse = json_encode($response);

// Send the JSON response
header('Content-Type: application/json');
echo $jsonResponse;
