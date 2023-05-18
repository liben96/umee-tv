<?php

// Include the database connection file
require_once 'common/db_connection.php';

// Your SQL query
$query = "SELECT c.id, `sourceTypeId`, ts.description as sourceType, `sourceId`, `name`, `channelName`, `typeOTTId`, tot.description as typeOTT, `typeSourceId`, c.ip, `typePVIId`, tp.description as typePVI, `pviPort`, `typePDUId`, tpdu.description as typePDU, `pduPort`, `box`, `rack`, `cardNumber`, `typeEscalationId`, te.description as typeEscalation, `priority`, `logo`, `enabled`, `updatedBy`, `updatedDate` FROM channel c LEFT JOIN typesSource ts ON c.sourceTypeId = ts.id LEFT JOIN typesPVI tp ON c.typePVIId = tp.id LEFT JOIN typesEscalation te ON c.typeEscalationId = te.id LEFT JOIN typesOTT tot ON c.typeEscalationId = tot.id LEFT JOIN typesPDU tpdu ON c.typeEscalationId = tpdu.id where enabled = 1";

// Execute the query
$result = $conn->query($query);

// Check if the query was successful
if ($result) {
    // Create an empty array to store the result
    $response = array();

    // Fetch the data from the result set
    while ($row = $result->fetch_assoc()) {
        // Add each row to the response array
        $response[] = $row;
    }

    // Convert the response array to JSON
    $jsonResponse = json_encode($response);

    // Send the JSON response
    header('Content-Type: application/json');
    echo $jsonResponse;
} else {
    // Query execution failed
    echo "Error executing the query: " . $conn->error;
}

// Close the database connection
$conn->close();
