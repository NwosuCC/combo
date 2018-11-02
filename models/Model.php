<?php

// CREATE table club (id int not null PRIMARY key, id_leagues text, `key` varchar(63), code varchar(63), name varchar(127))

class Model {

    const BETS = [
        '1' => ['1', '1X', 'X2', '2'],
        '2' => ['GG'],
        '3' => ['U0.5', 'U1.5', 'U2.5', 'U3.5', 'U4.5'],
        '4' => ['O0.5', 'O1.5', 'O2.5', 'O3.5', 'O4.5'],
        '5' => ['1 -1'],
    ];


    protected $db, $schema;

    protected $id = '';


    protected function __construct($schema){
        $this->db = new DB();
        $this->schema = $schema;
    }

    public function id() { return $this->id; }

    public function get( $id = '') {
        return $this->getRecord( $id );
    }

    protected function getId( $id ) {
        $this->db->id();
        return $this->getRecord( $id );
    }

    public function find( $id = '') {
        return $this->getId( $id );
    }

    protected function addRecord( Array $record, $update_values = [] ) {
        list( $table, $columns, $values, $where ) = $record;

        if($update_values and is_array($update_values)) {
            $new_id = $this->db->insert( $table, $columns, $values, $update_values );
        }else{
            $new_id = $values and $this->db->insertUnique( $table, $columns, $values, $where );
        }

        return $new_id ? $this->db->getLastInsert( $table, $columns ) : null;
    }

    protected function getRecord(string $id = '') {
        list($table, $columns) = $this->schema;
        if( ! array_search('id', $columns)){ $columns[] = 'id'; }

        $where = [ "deleted = 0", [] ];
        if($id) {
            $where[0] .= " AND id = ?1";
            $where[1][] = $id;
        }

        $this->db->select($table, $columns, $where);

        return $this->db;
    }

    protected function updateRecord( Array $record ) {
        list( $table, $columns, $values, $where ) = $record;

        $new_id = $values and $this->db->insertUnique( $table, $columns, $values, $where );

        return $new_id ? $this->db->getLastInsert( $table, $columns ) : null;
    }


}

