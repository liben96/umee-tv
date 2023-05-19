<?php

$servername = "sn-db.sapphire-int.gi";
$username = "egalvez";
$password = "f2YOS72D8DHikacYkODy";
$database = "xmltv";
$port = 23306;

// Create the database connection
$conn = new mysqli($servername, $username, $password, $database, $port);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
