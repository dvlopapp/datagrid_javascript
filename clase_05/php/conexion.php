<?php

class Connect {

    private $_host = 'localhost';
    private $_user = 'root';
    private $_pass = '';
    private $_db = 'data_grid';
    private $_port = '3306';
    private $_con;

    public function _open() {
        $this->_con = new PDO('mysql:host=' . $this->_host . ';port=' . $this->_port . ';dbname=' . $this->_db,
                $this->_user,
                $this->_pass,
                [
            PDO::ATTR_PERSISTENT => false,
            PDO::MYSQL_ATTR_LOCAL_INFILE => true
        ]);
        $this->_con->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->_con->exec('set names utf8');
    }
    
    public function query($query,$param) {
        $this->_open();
        try {
            $rs = $this->_con->prepare($query);
            $rs->execute($param);
            return $rs->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $ex) {
            echo $ex->getMessage();
        }
    }

}
