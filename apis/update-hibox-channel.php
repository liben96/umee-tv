<?php

$allowedRoleIds = [1];
// Include the database connection file
require_once 'common/authentication.php';
// Include the soap file
require_once 'common/soap.php';

// Create the response object
$response = array(
    'success' => false,
    'message' => ''
  );

try {
    // Read the request body
    $requestBody = file_get_contents('php://input');
    $data = json_decode($requestBody, true);

    if(isset($data['number']) && isset($data['name']) && isset($data['id']) && isset($data['epgId']) && isset($data['numberInNetwork']) && isset($data['type'])) {
        $body = array(
            'channel' => array(
                'id' => $data['id'],
                'name' => $data['name'],
                'type' => $data['type'],
                'number' => $data['number'],
                'epgId' => $data['epgId'],
                'numberInNetwork' => $data['numberInNetwork']
            )
        );

        // calling update SOAP call
        $hiboxRes = callSoap('updateChannel', array($body));

        // Check if the SOAP call was successful
        if (isset($hiboxRes) && $hiboxRes['success']) {
            $response['success'] = true;
            $response['message'] = "Channel successfully synced in Hibox";
        } else {
            // SOAP call failed
            $response['success'] = false;
            $response['message'] = "Error syncing channel in Hibox: ".$hiboxRes['message'];
        }
    } else {
        // misssing parameters
        $response['success'] = false;
        $response['message'] = "Missing parameters";
    }
} catch (Exception $e) {
    // Handle the exception and return an error message
    $response['success'] = false;
    $response['message'] = "Something went wrong: ". $e->getMessage();
}

// Convert the response array to JSON
$jsonResponse = json_encode($response);

// Send the JSON response
header('Content-Type: application/json');
echo $jsonResponse;
