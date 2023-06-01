<?php

function add_log($conn, $text)
{
    $finalText = "{$_SESSION['userFullName']} {$text}";

    // SQL query
    $query = "INSERT INTO logs (userId, description) VALUES ({$_SESSION['userId']}, '{$finalText}')";

    // Execute the query
    $result = $conn->query($query);
}
