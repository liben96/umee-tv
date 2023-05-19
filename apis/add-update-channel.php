<?php

// Include the database connection file
require_once 'common/db_connection.php';

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
    if ($data !== null) {
        // Check if the 'id' field is present in the JSON body
        $id = $data['id'];
        if (isset($id)) {
            // Build the dynamic update query based on the provided data
            $query = "UPDATE channel SET ";

            foreach ($data as $key => $value) {
                if ($key != 'id') {
                    // Check if the value is empty
                    if ($value === '') {
                        // Replace empty value with NULL keyword
                        $query .= $key . " = NULL, ";
                    } else {
                        // Add non-empty value to the query
                        $query .= $key . " = '" . $value . "', ";
                    }
                }
            }

            // Remove the trailing comma and space from the query
            $query = rtrim($query, ", ");

            // Add the WHERE condition to update the row with the specified ID
            $query .= " WHERE id = " . $id;
        } else {
            // ID is not present, add a new row

            // Build the dynamic insert query based on the provided data
            $query = "INSERT INTO channel (";

            // Get the list of keys
            $keys = array_keys($data);

            // Add the keys to the query
            $query .= implode(", ", $keys);

            $query .= ") VALUES (";

            // Build the placeholder values for prepared statement
            $placeholders = array();

            foreach ($data as $value) {
                // Check if the value is empty
                if ($value === '') {
                    // Replace empty value with NULL keyword
                    $placeholders[] = "NULL";
                } else {
                    $placeholders[] = "'" . $value . "'";
                }
            }

            // Add the placeholder values to the query
            $query .= implode(", ", $placeholders);

            $query .= ")";
        }

        // Execute the query
        $result = $conn->query($query);

        // Check if the query was successful
        if ($result) {
            $response['success'] = true;
            // Query executed successfully
            if (isset($id)) {
                $response['message'] = "Channel updated successfully.";
            } else {
                $response['message'] = "New channel added successfully.";
            }

        } else {
            $response['success'] = false;
            $response['message'] = "Error executing the query";
        }
    } else {
        // JSON decoding failed
        $response['success'] = false;
        $response['message'] = "Failed to decode JSON data.";
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
