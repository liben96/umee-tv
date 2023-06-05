<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__. '/../../vendor/autoload.php'; // Include the Composer autoloader

// Load the environment file
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__.'/../../');
$dotenv->load();

function sendEmail($to, $subject, $body)
{
    // Create the response object
    $response = array(
        'success' => false,
        'message' => ''
      );

    try {
        $mail = new PHPMailer();

        // Enable SMTP debugging if needed
        // $mail->SMTPDebug = SMTP::DEBUG_SERVER;

        $mail->isSMTP();
        $mail->SMTPAuth = true;
        $mail->Host = $_ENV['MAIL_HOST'];
        $mail->Username = $_ENV['MAIL_USERNAME'];
        $mail->Password = $_ENV['MAIL_PASSWORD'];
        $mail->Port = $_ENV['MAIL_PORT'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;

        // Sender and recipient
        $mail->setFrom($_ENV['MAIL_USERNAME'], $_ENV['MAIL_NAME']);
        $mail->addAddress($to);

        // Email content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $body;

        // Send the email
        if ($mail->send()) {
            $response['success'] = true;
            $response['message'] = "Email sent successfully.";
        } else {
            $response['success'] = true;
            $response['message'] = "Failed to send the email. Error: " . $mail->ErrorInfo;
        }
    } catch (Exception $e) {
        // Handle the exception and return an error message
        $response['success'] = false;
        $response['message'] = $e->getMessage();
    }
    return $response;
}
