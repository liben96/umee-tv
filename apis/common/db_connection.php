<?php

$servername = "localhost";
$username = "root";
$password = "root";
$database = "xmltv";
$port = 8889;

// Create the database connection
$conn = new mysqli($servername, $username, $password, $database, $port);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
