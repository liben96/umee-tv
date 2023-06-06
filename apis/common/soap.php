<?php

require_once __DIR__. '/../../vendor/autoload.php'; // Include the Composer autoloader

// Load the environment file
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__.'/../../');
$dotenv->load();

function soapClientWSSecurityHeader($user, $password)
{
    // Creating date using yyyy-mm-ddThh:mm:ssZ format
    $tm_created = gmdate('Y-m-d\TH:i:s\Z');
    $tm_expires = gmdate('Y-m-d\TH:i:s\Z', gmdate('U') + 180); //only necessary if using the timestamp element

    // Generating and encoding a random number
    $simple_nonce = mt_rand();
    $encoded_nonce = base64_encode($simple_nonce);

    // Compiling WSS string
    $passdigest = base64_encode(sha1($simple_nonce . $tm_created . $password, true));

    // Initializing namespaces
    $ns_wsse = 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd';
    $ns_wsu = 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd';
    $password_type = 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText';
    $encoding_type = 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary';

    // Creating WSS identification header using SimpleXML
    $root = new SimpleXMLElement('<root/>');

    $security = $root->addChild('wsse:Security', null, $ns_wsse);

    $usernameToken = $security->addChild('wsse:UsernameToken', null, $ns_wsse);
    $usernameToken->addChild('wsse:Username', $user, $ns_wsse);
    $usernameToken->addChild('wsse:Password', $password, $ns_wsse)->addAttribute('Type', $password_type);
    $usernameToken->addChild('wsse:Nonce', $encoded_nonce, $ns_wsse)->addAttribute('EncodingType', $encoding_type);
    $usernameToken->addChild('wsu:Created', $tm_created, $ns_wsu);

    // Recovering XML value from that object
    $root->registerXPathNamespace('wsse', $ns_wsse);
    $full = $root->xpath('/root/wsse:Security');
    $auth = $full[0]->asXML();

    return new SoapHeader($ns_wsse, 'Security', new SoapVar($auth, XSD_ANYXML), true);
}

function callSoap($method, $params)
{
    // Create the response object
    $response = array(
        'success' => false,
        'message' => ''
      );

    try {
        // WSDL URL
        $wsdl = $_ENV['HIBOX_BASE_URL'].$_ENV['HIBOX_WSDL_PATH'];

        // Authentication credentials
        $username = $_ENV['HIBOX_USERNAME'];
        $password = $_ENV['HIBOX_PASSWORD'];

        // Disable SSL verification (for testing purposes only)
        $options = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false
            ),
        );

        // Create SOAP client
        $client = new SoapClient($wsdl, array('trace' => 1, 'stream_context' => stream_context_create($options)));

        $client->__setSoapHeaders(soapClientWSSecurityHeader($username, $password));

        $soapRes = $client->__soapCall($method, $params);

        // Send the response
        if ($soapRes) {
            $response['success'] = true;
            if(isset($params) && count($params) === 0) {
                $response['data'] = $soapRes->return;
            }
        } else {
            $response['success'] = true;
            $response['message'] = "Failed to load data from hibox";
        }
    } catch (Exception $e) {
        // Handle the exception and return an error message
        $response['success'] = false;
        $response['message'] = $e->getMessage();
    }
    return $response;
}
