<?php

// Create the response object
$response = array(
    'success' => false,
    'message' => ''
  );

if(isset($_FILES['image'])) {
    $errors = array();
    $file_name = $_FILES['image']['name'];
    $file_size = $_FILES['image']['size'];
    $file_tmp = $_FILES['image']['tmp_name'];
    $file_type = $_FILES['image']['type'];
    $file_ext = explode('.', $_FILES['image']['name']);
    $file_ext = strtolower(end($file_ext));

    $extensions = array("jpeg","jpg","png");

    if(in_array($file_ext, $extensions) === false) {
        $error = "Extension not allowed, please choose a JPEG or PNG file.";
    }

    // if($file_size > 2097152){
    //     $errors[] = 'File size must be less than 2 MB';
    // }

    if(!isset($error)) {
        $parentDir = __DIR__ . '/../';
        move_uploaded_file($file_tmp, $parentDir ."assets/images/logos/".$file_name);
        $response['success'] = true;
        $response['message'] = 'Success! File uploaded successfully.';
        $response['data'] = $file_name;
    } else {
        $response['success'] = false;
        $response['message'] = $error;
    }
} else {
    $response['success'] = false;
    $response['message'] = 'No file selected for upload';
}
// Convert the response array to JSON
$jsonResponse = json_encode($response);
// Send the JSON response
header('Content-Type: application/json');
echo $jsonResponse;
