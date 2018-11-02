<?php
$_ENV = [
    'development' => true,
    'timezone' => 'Africa/Lagos',

    'database' => [
        'host' => 'localhost',
        'user' => 'user',
        'password' => 'secret',
        'db' => 'dbname'
    ],
];

if($_ENV['development']){
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
}
