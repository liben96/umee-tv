<?php

$allowedRoleIds = [1,2];
// Include the database connection file
require_once 'common/authentication.php';
// Include the database connection file
require_once 'common/db_connection.php';

// Create the response object
$response = array(
    'success' => false,
    'message' => ''
  );

// Your SQL query
$query = "SELECT * FROM iptvProviders";

// Execute the query
$result = $conn->query($query);

// Check if the query was successful
if ($result) {
    // Create an empty array to store the result
    $responseDB = array();

    // Fetch the data from the result set
    while ($row = $result->fetch_assoc()) {
        // Add each row to the response array
        $responseDB[] = $row;
    }

    $response['success'] = true;
    $response['data'] = $responseDB;
} else {
    // Query execution failed
    $response['message'] = "Error executing the query: " . $conn->error;
}

// Close the database connection
$conn->close();

// Convert the response array to JSON
$jsonResponse = json_encode($response);

// Send the JSON response
header('Content-Type: application/json');
echo $jsonResponse;
