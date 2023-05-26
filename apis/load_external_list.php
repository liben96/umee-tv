<?php

$allowedRoleIds = [1];
require_once 'common/authentication.php';

// Read the request body
$requestBody = file_get_contents('php://input');
$body = json_decode($requestBody, true);

// Create the response object
$response = array(
    'success' => false,
    'message' => ''
  );

try {
    if(isset($body['url']) && isset($body['user']) && isset($body['password'])) {
        // Get the URL and username from the body
        $url = $body['url'];
        $username = $body['user'];
        $password = $body['password'];

        $finalUrl = $url. '/streamer/api/v3/streams/';
        // Create a cURL handle
        $ch = curl_init($finalUrl);

        // Set the basic authentication header
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
        curl_setopt($ch, CURLOPT_USERPWD, $username . ':' . $password);

        // Make the request
        $responseCurl = curl_exec($ch);

        // Check the response code
        if ($responseCurl === false) {
            $response['success'] = false;
            $response['message'] = json_encode([
                'error' => curl_error($ch),
              ]);
        } else {
            // Return the response in JSON
            $response['success'] = true;
            $response['data'] = json_decode($responseCurl, true);
        }

        // Close the cURL handle
        curl_close($ch);
    } else {
        $response['success'] = false;
        $response['message'] = 'Missing parameters in body';
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
