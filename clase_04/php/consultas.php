<?php


require_once 'conexion.php';


$db = new Connect();

$query= 'CALL sp_listado (:start,:length,:order,:filter,:excel); ';
$params = [
    ':start' => 0,
    ':length' => 10,
    ':order' => '',
    ':filter' => '',
    ':excel' => 0
];

$rs = $db->query($query, $params);


echo json_encode($rs);