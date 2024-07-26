<?php
header("Content-Type: application/json");

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$method = $_SERVER['REQUEST_METHOD'];

function getRandomAntennaNum() {
    return rand(1, 4);
}

if ($method === 'OPTIONS') {
    // Respond to preflight request
    header("HTTP/1.1 204 No Content");
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (isset($data['command'])) {
        $command = $data['command'];

        switch ($command) {
            case 'n':
                $response = [
                    'payload' => [
                        'response' => 'n:' . getRandomAntennaNum()
                    ]
                ];
                break;
            case 's':
                $response = [
                    'payload' => [
                        'response' => (string) getRandomAntennaNum()
                    ]
                ];
                break;
            default:
                $response = [
                    'payload' => [
                        'response' => 'Invalid command'
                    ]
                ];
                break;
        }

        echo json_encode($response);
    } else {
        echo json_encode(['error' => 'No command provided']);
    }
} else {
    echo json_encode(['error' => 'Invalid request method']);
}
?>
