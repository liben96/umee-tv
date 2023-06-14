<?php

$allowedRoleIds = [1];
// Include the database connection file
require_once 'common/authentication.php';
// Include the database connection file
require_once 'common/db_connection.php';
// Create the response object
$response = array(
    'success' => false,
    'message' => ''
  );

try {
    if(isset($_FILES['file'])) {
        if(isset($_POST['iptvProviderName'])) {
            // Insert provider if name is provided
        } else {
            $iptvProviderId = $_POST['iptvProviderId'];
        }

        if(isset($_POST['category'])) {
            $category = $_POST['category'];
        } else {
            $category = 'NULL';
        }
        $file = fopen($_FILES['file']['tmp_name'], 'r');

        // Initialize variables
        $query = '';
        $names = array();
        $urls = array();

        // Read the file line by line
        while (($line = fgets($file)) !== false) {
            // Check if the line starts with 'http'
            if (strpos($line, 'http') === 0) {
                // If it starts with 'http', it's the URL
                $urls[] = trim($line);
            } elseif (strpos($line, ',') !== false) {
                // If it contains a comma, it's the name
                $names[] = trim(explode(',', $line)[1]);
            }
        }

        // Generate the INSERT queries
        $count = min(count($names), count($urls));
        for ($i = 0; $i < $count; $i++) {
            $name = mysqli_real_escape_string($conn, $names[$i]);
            $url = mysqli_real_escape_string($conn, $urls[$i]);
            $category = mysqli_real_escape_string($conn, $category);

            $query .= "INSERT INTO streams (iptvProviderId, channelName, url, category) VALUES ($iptvProviderId, '$name', '$url', '$category');\n";
        }

        // Execute the query
        $result = $conn->query($query);

        if($result) {
            $response['success'] = true;
            $response['message'] = 'Success! File imported successfully.';
            $response['data'] = $file_name;
        } else {
            $response['success'] = false;
            $response['message'] = 'Error while importing';
        }
    } else {
        $response['success'] = false;
        $response['message'] = 'No file selected for import';
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
