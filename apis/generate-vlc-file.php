<?php

$allowedRoleIds = [1];
require_once 'common/authentication.php';

// Read the request body
$requestBody = file_get_contents('php://input');
$body = json_decode($requestBody, true);

// Create the response object
$response = array(
    'error' => false,
    'message' => ''
  );

try {
    if(isset($body['name']) && isset($body['url'])) {
        // Get the URL and name from the body
        $url = $body['url'];
        $name = $body['name'];

        $content = "#EXTM3U\n";
        $content .= "#EXTINF:-1,".$name."\n";
        $content .= $url;

        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="' . $name . '.vlc"');
        header('Content-Length: ' . strlen($content));
        echo $content;
    } else {
        $response['error'] = true;
        $response['message'] = 'Missing parameters in body';

        // Convert the response array to JSON
        $jsonResponse = json_encode($response);

        // Send the JSON response
        header('Content-Type: application/json');
        echo $jsonResponse;
    }
} catch (Exception $e) {
    // Handle the exception and return an error message
    $response['error'] = true;
    $response['message'] = $e->getMessage();

    // Convert the response array to JSON
    $jsonResponse = json_encode($response);

    // Send the JSON response
    header('Content-Type: application/json');
    echo $jsonResponse;
}
