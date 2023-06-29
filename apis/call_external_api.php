<?php

$allowedRoleIds = [1, 2];
require_once 'common/authentication.php';
// Include the database connection file
require_once 'common/db_connection.php';
require_once 'common/logger.php';

// Read the request body
$requestBody = file_get_contents('php://input');
$data = json_decode($requestBody, true);

// Create the response object
$response = array(
    'success' => false,
    'message' => ''
  );

try {
    if(isset($data['url']) && isset($data['user']) && isset($data['password']) && isset($data['action'])) {
        // Get the URL and username from the body
        $url = (($data['action'] == 'blackout') ? ($data['url'] . '/streamer/api/v3/streams/' .$data['number']) : ($data['url'] . '/streamer/api/v3/streams/' .$data['number']. '/stop'));
        $username = $data['user'];
        $password = $data['password'];

        // Create a cURL handle
        $ch = curl_init($url);

        // Make post call if body is present
        if(isset($data['body'])) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data['body']));
            curl_setopt($ch, CURLOPT_HTTPHEADER, array(
                'Content-Type: application/json',
            ));
        }

        if($data['action'] == 'blackout') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
        } else {
            curl_setopt($ch, CURLOPT_POST, 1);
        }

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
            if($data['action'] == 'blackout') {
                $logText = ($data['blackoutEnabled'] ? 'enabled' : 'disabled') . ' blackout for';
            } else {
                $logText = "restarted";
            }
            $logText = $logText . " channel {$data['channelName']} (#{$data['number']})";
            add_log($conn, $logText);
            // Return the response in JSON
            $response['success'] = true;
            $response['message'] = 'Action completed successfully';
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
