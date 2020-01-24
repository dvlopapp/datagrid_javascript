<?php


require_once 'conexion.php';


$db = new Connect();

$start = $_POST['_start'];
$length = $_POST['_length'];

$query= 'CALL sp_listado (:start,:length,:order,:filter,:excel); ';
$params = [
    ':start' => $start,
    ':length' => $length,
    ':order' => '',
    ':filter' => '',
    ':excel' => 0
];

$rs = $db->query($query, $params);


echo json_encode($rs);