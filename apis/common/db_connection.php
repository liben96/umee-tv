<?php

require_once __DIR__. '/../../vendor/autoload.php'; // Include the Composer autoloader

// Load the environment file
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__.'/../../');
$dotenv->load();

$servername = $_ENV['DB_HOST'];
$username = $_ENV['DB_USERNAME'];
$password = $_ENV['DB_PASSWORD'];
$database = $_ENV['DB_DATABASE'];
$port = $_ENV['DB_PORT'];

// Create the database connection
$conn = new mysqli($servername, $username, $password, $database, $port);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
