<?php

// Include the database connection file
require_once 'common/db_connection.php';

// Your SQL queries
$query1 = "SELECT * FROM typesEscalation";
$query2 = "SELECT * FROM typesOTT";
$query3 = "SELECT * FROM typesPDU";
$query4 = "SELECT * FROM typesPVI";
$query5 = "SELECT * FROM typesSource";

// Create an empty array to store the results
$response = array();

// Execute the first query
$result1 = $conn->query($query1);
if ($result1) {
    // Fetch the data from the result set
    $data1 = array();
    while ($row = $result1->fetch_assoc()) {
        $data1[] = $row;
    }
    // Add the data to the response array
    $response['typesEscalation'] = $data1;
} else {
    // Query execution failed
    echo "Error executing query 1: " . $conn->error;
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
    $response['typesOTT'] = $data2;
} else {
    // Query execution failed
    echo "Error executing query 2: " . $conn->error;
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
    $response['typesPDU'] = $data3;
} else {
    // Query execution failed
    echo "Error executing query 3: " . $conn->error;
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
    $response['typesPVI'] = $data4;
} else {
    // Query execution failed
    echo "Error executing query 4: " . $conn->error;
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
    $response['typesSource'] = $data5;
} else {
    // Query execution failed
    echo "Error executing query 5: " . $conn->error;
}

// Close the database connection
$conn->close();

// Convert the response array to JSON
$jsonResponse = json_encode($response);

// Send the JSON response
header('Content-Type: application/json');
echo $jsonResponse;
