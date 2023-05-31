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
$query = "SELECT c.id, typeSourceId, ts.description as typeSource, name, channelName, typeOTTId, tot.description as typeOTT, tot.url as flusonicUrl, c.ip, typePVIId, tp.description as typePVI, pviPort, typePDUId, tpdu.description as typePDU, pduPort, box, rack, cardNumber, cardNumberExpiry, typeEscalationId, te.description as typeEscalation, wikiUrl, priority, logo, enabled, updatedBy, updatedDate FROM channel c LEFT JOIN typesSource ts ON c.typeSourceId = ts.id LEFT JOIN typesPVI tp ON c.typePVIId = tp.id LEFT JOIN typesEscalation te ON c.typeEscalationId = te.id LEFT JOIN typesOTT tot ON c.typeOTTId = tot.id LEFT JOIN typesPDU tpdu ON c.typePDUId = tpdu.id WHERE (c.deleted = 0 or c.deleted IS NULL) ORDER BY c.name";

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
