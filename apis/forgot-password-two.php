<?php

// Include the database connection file
require_once 'common/db_connection.php';
require_once 'common/logger.php';

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
    if ($data !== null && isset($data['email']) && isset($data['code']) && isset($data['password'])) {
        // Form submitted, perform authentication
        $email = $data['email'];
        $code = $data['code'];
        $password = $data['password'];

        $query = "SELECT email, code, codeExpiry FROM users WHERE email = '$email' AND code = '$code'";

        // Execute the query
        $result = $conn->query($query);

        $resUser = $result->fetch_assoc();

        // Check if the query was successful
        if ($resUser) {
            // Check if code is not expired
            if ($resUser['codeExpiry'] >= date('Y-m-d H:i:s')) {

                $querySetPassword = "UPDATE users SET password = md5('$password') WHERE email = '$email'";
                // Execute the query
                $resultPass = $conn->query($querySetPassword);

                // Check if query was successful
                if ($resultPass) {
                    $response['success'] = true;
                    // Query executed successfully
                    $response['message'] = "You have successfully changed your password";
                    // add_log($conn, 'logged in');
                } else {
                    $response['success'] = false;
                    $response['message'] = "Error while sending email";
                }
            } else {
                $response['success'] = false;
                $response['message'] = "The code that you have entered is expired";
            }
        } else {
            $response['success'] = false;
            $response['message'] = "You have entered wrong code";
        }
    } else {
        // JSON decoding failed
        $response['success'] = false;
        $response['message'] = "Please enter a code";
    }

    // Close the database connection
    $conn->close();
} else {
    // No data received
    $response['success'] = false;
    $response['message'] = "Please enter a code";
}

// Convert the response array to JSON
$jsonResponse = json_encode($response);
// Send the JSON response
header('Content-Type: application/json');
echo $jsonResponse;
