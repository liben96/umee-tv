<?php

$allowedRoleIds = [1];
// Include the database connection file
require_once 'common/authentication.php';
// Include the database connection file
require_once 'common/db_connection.php';
// Include the database logger file
require_once 'common/logger.php';

try {
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
        $log = "";
        // Check if JSON decoding was successful
        if ($data !== null && isset($data['newValues']) && isset($data['oldValues'])) {
            if(isset($data['id']) && count($data['newValues']) == 1) {
                // Send success back if no change and only contains id
                $response['success'] = true;
                $response['message'] = "Channel updated successfully.";
            } else {
                // $log = "updated channel {$data['name']} - {$data['channelName']} (#{$data['id']}) with values (";

                // Check if the 'id' field is present in the JSON body
                if (isset($data['id'])) {
                    $log = "updated channel ". (isset($data['newValues']['name']) ? $data['newValues']['name'] : $data['name'])." - ". (isset($data['newValues']['channelName']) ? $data['newValues']['channelName'] : $data['channelName'])." (#{$data['id']}) with values (";
                    $id = $data['id'];
                    // Build the dynamic update query based on the provided data
                    $query = "UPDATE channel SET ";

                    foreach ($data['newValues'] as $key => $value) {
                        if ($key != 'id' && $key !== 'typeEscalation' && $key !== 'typeOTT' && $key !== 'typePDU' && $key !== 'typePVI' && $key !== 'typeSource') {
                            $log = $log . "$key: {$data['oldValues'][$key]} -> $value, ";
                            // Check if the value is empty
                            if ($value === '') {
                                // Replace empty value with NULL keyword
                                $query .= $key . " = NULL, ";
                            } else {
                                $finalValue = mysqli_real_escape_string($conn, $value);
                                // Add non-empty value to the query
                                $query .= $key . " = '" . $finalValue . "', ";
                            }
                        } else {
                            if($key != 'id') {
                                $log = $log . "$key: {$data['oldValues'][$key]} -> $value, ";
                            }
                        }
                    }

                    // Remove the trailing comma and space from the log
                    $log = rtrim($log, ", ");
                    $log .= ")";

                    // Remove the trailing comma and space from the query
                    $query = rtrim($query, ", ");

                    // Add the WHERE condition to update the row with the specified ID
                    $query .= " WHERE id = " . $id;
                } else {
                    $log = "added channel ". (isset($data['newValues']['name']) ? $data['newValues']['name'] : $data['name'])." - ". (isset($data['newValues']['channelName']) ? $data['newValues']['channelName'] : $data['channelName']);
                    // ID is not present, add a new row

                    // Build the dynamic insert query based on the provided data
                    $query = "INSERT INTO channel (";

                    // Get the list of keys
                    $keys = [];
                    $values = [];

                    foreach ($data['newValues'] as $key => $value) {
                        if ($key != 'id' && $key !== 'typeEscalation' && $key !== 'typeOTT' && $key !== 'typePDU' && $key !== 'typePVI' && $key !== 'typeSource') {
                            array_push($keys, $key);
                            array_push($values, $value);
                        }
                    }

                    // Add the keys to the query
                    $query .= implode(", ", $keys);

                    $query .= ") VALUES (";

                    // Build the placeholder values for prepared statement
                    $placeholders = array();

                    foreach ($values as $value) {
                        if ($key !== 'typeEscalation' && $key !== 'typeOTT' && $key !== 'typePDU' && $key !== 'typePVI' && $key !== 'typeSource') {
                            // Check if the value is empty
                            if ($value === '') {
                                // Replace empty value with NULL keyword
                                $placeholders[] = "NULL";
                            } else {
                                $finalValue = mysqli_real_escape_string($conn, $value);
                                $placeholders[] = "'" . $finalValue . "'";
                            }
                        }
                    }

                    // Add the placeholder values to the query
                    $query .= implode(", ", $placeholders);

                    $query .= ")";
                    // $log = "added channel {$data['channelName']}";
                }

                // Execute the query
                $result = $conn->query($query);

                // Check if the query was successful
                if ($result) {
                    $response['success'] = true;
                    // Query executed successfully
                    if (isset($id)) {
                        add_log($conn, $log);
                        $response['message'] = "Channel updated successfully.";
                    } else {
                        add_log($conn, $log);
                        $response['message'] = "New channel added successfully.";
                    }

                } else {
                    $response['success'] = false;
                    $response['message'] = "Error executing the query: " . $conn->error;
                }
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
