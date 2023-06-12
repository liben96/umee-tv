<?php

// Open the text file
$file = fopen("streams.txt", "r");

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
    $name = $names[$i];
    $url = $urls[$i];

    $query .= "INSERT INTO streams (iptvProviderId, channelName, url) VALUES (1, '$name', '$url');\n";
}

// Close the file
fclose($file);

// Output the generated queries
echo $query;
