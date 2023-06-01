<?php

function add_log($conn, $text)
{
    $finalText = "{$_SESSION['userFullName']} {$text}";

    // SQL query
    $query = "INSERT INTO logs (userId, description) VALUES ({$_SESSION['userId']}, '{$finalText}')";

    // Execute the query
    $result = $conn->query($query);
}

function add_log_public($conn, $userId, $text)
{
    // SQL query
    $query = "INSERT INTO logs (userId, description) VALUES ($userId, '{$text}')";

    // Execute the query
    $result = $conn->query($query);
}
