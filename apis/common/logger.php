<?php

function add_log($conn, $text)
{
    $finalText = "{$_SESSION['userFullName']} {$text}";
    $finalValue = mysqli_real_escape_string($conn, $finalText);

    // SQL query
    $query = "INSERT INTO logs (userId, description) VALUES ({$_SESSION['userId']}, '{$finalValue}')";

    // Execute the query
    $result = $conn->query($query);
}

function add_log_public($conn, $userId, $text)
{
    $finalValue = mysqli_real_escape_string($conn, $text);
    // SQL query
    $query = "INSERT INTO logs (userId, description) VALUES ($userId, '{$finalValue}')";

    // Execute the query
    $result = $conn->query($query);
}
