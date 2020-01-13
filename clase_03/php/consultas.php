<?php


require_once 'conexion.php';


$db = new Connect();

$query= '';
$params = [];

$rs = $db->query($query, $params);


echo json_encode($rs);