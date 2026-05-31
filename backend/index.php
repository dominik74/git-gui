<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$input = file_get_contents('php://input');
$data = json_decode($input, true);
$command = $data['command'] ?? '';
$cwd = $data['cwd'] ?? '../git';

error_log('< received from client, command:');
error_log($command);

header('Content-Type: application/json');

chdir($cwd);
$shellOutput = shell_exec($command);
$output = mb_convert_encoding($shellOutput, 'UTF-8', 'UTF-8');

error_log('> sending to client, command output:');
error_log($output);

echo json_encode([
	'output' => $output
]);
