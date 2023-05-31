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
    if ($data !== null && isset($data['email'])) {
        // Form submitted, perform authentication
        $email = $data['email'];

        $query = "SELECT id FROM users WHERE email = '$email' AND enabled = 1";

        // Execute the query
        $result = $conn->query($query);

        $resUser = $result->fetch_assoc();

        // Check if the query was successful
        if ($resUser) {
            // Generate a random OTP code
            $otp = rand(1000, 9999);

            // Calculate the expiry date (e.g., 10 minutes from now)
            $expiryDate = date('Y-m-d H:i:s', strtotime('+10 minutes'));

            $querySetCode = "UPDATE users SET code = '$otp', codeExpiry = '$expiryDate' WHERE email = '$email'";
            // Execute the query
            $resultCode = $conn->query($querySetCode);

            // Send email with the code

            // Check if the email was sent successful
            if (true) {

                $response['success'] = true;
                // Query executed successfully
                $response['message'] = "Please enter code that was sent to your provided email. Code will expire after 10 mins.";
                // add_log($conn, 'logged in');
            } else {
                $response['success'] = false;
                $response['message'] = "Error while sending email";
            }
        } else {
            $response['success'] = false;
            $response['message'] = "Please check your email address";
        }
    } else {
        // JSON decoding failed
        $response['success'] = false;
        $response['message'] = "Please enter an email address";
    }

    // Close the database connection
    $conn->close();
} else {
    // No data received
    $response['success'] = false;
    $response['message'] = "Please enter an email address";
}

// Convert the response array to JSON
$jsonResponse = json_encode($response);
// Send the JSON response
header('Content-Type: application/json');
echo $jsonResponse;
