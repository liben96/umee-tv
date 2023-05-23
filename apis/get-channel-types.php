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

// Your SQL queries
$query1 = "SELECT * FROM typesEscalation";
$query2 = "SELECT * FROM typesOTT";
$query3 = "SELECT * FROM typesPDU";
$query4 = "SELECT * FROM typesPVI";
$query5 = "SELECT * FROM typesSource";
$query6 = "SELECT * FROM typesMediaExcel";

// Create an empty array to store the results
$responseDB = array();

// Execute the first query
$result1 = $conn->query($query1);
if ($result1) {
    // Fetch the data from the result set
    $data1 = array();
    while ($row = $result1->fetch_assoc()) {
        $data1[] = $row;
    }
    // Add the data to the response array
    $responseDB['typesEscalation'] = $data1;
} else {
    // Query execution failed
    $response['message'] = "Error executing query 1: " . $conn->error;
}

// Execute the second query
$result2 = $conn->query($query2);
if ($result2) {
    // Fetch the data from the result set
    $data2 = array();
    while ($row = $result2->fetch_assoc()) {
        $data2[] = $row;
    }
    // Add the data to the response array
    $responseDB['typesOTT'] = $data2;
} else {
    // Query execution failed
    $response['message'] = "Error executing query 2: " . $conn->error;
}

// Execute the third query
$result3 = $conn->query($query3);
if ($result3) {
    // Fetch the data from the result set
    $data3 = array();
    while ($row = $result3->fetch_assoc()) {
        $data3[] = $row;
    }
    // Add the data to the response array
    $responseDB['typesPDU'] = $data3;
} else {
    // Query execution failed
    $response['message'] = "Error executing query 3: " . $conn->error;
}

// Execute the fourth query
$result4 = $conn->query($query4);
if ($result4) {
    // Fetch the data from the result set
    $data4 = array();
    while ($row = $result4->fetch_assoc()) {
        $data4[] = $row;
    }
    // Add the data to the response array
    $responseDB['typesPVI'] = $data4;
} else {
    // Query execution failed
    $response['message'] = "Error executing query 4: " . $conn->error;
}

// Execute the fourth query
$result5 = $conn->query($query5);
if ($result5) {
    // Fetch the data from the result set
    $data5 = array();
    while ($row = $result5->fetch_assoc()) {
        $data5[] = $row;
    }
    // Add the data to the response array
    $responseDB['typesSource'] = $data5;
} else {
    // Query execution failed
    $response['message'] = "Error executing query 5: " . $conn->error;
}

$result6 = $conn->query($query6);
if ($result6) {
    // Fetch the data from the result set
    $data6 = array();
    while ($row = $result6->fetch_assoc()) {
        $data6[] = $row;
    }
    // Add the data to the response array
    $responseDB['typesMediaExcel'] = $data6;
} else {
    // Query execution failed
    $response['message'] = "Error executing query 6: " . $conn->error;
}

$response['success'] = true;
$response['data'] = $responseDB;


// Close the database connection
$conn->close();

// Convert the response array to JSON
$jsonResponse = json_encode($response);

// Send the JSON response
header('Content-Type: application/json');
echo $jsonResponse;
