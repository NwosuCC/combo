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


    protected $db, $schema, $where = [];

    protected $id = '';


    protected function __construct($schema){
        $this->db = new DB();
        $this->schema = $schema;
    }

    public function id() { return $this->id; }

    public function get( $id = '') {
        return $this->getRecord( $id );
    }

    protected function find( $id ) {
        $this->db->id();
        return $this->getRecord( $id );
    }

    /*protected function with( $schema ) {
        list($table_A, $columns_A) = $this->schema;
        list($table_B, $columns_B) = $schema;


        return $this;
    }*/

    protected function where( Array $where ) {
        if( !$where){
            throw new Error('where() Example: [ "name = ?2 OR email = ?3", [$name, $email] ]');
        }
        else if( stristr($where[0], '?1')){
            throw new Error("'WHERE...' clause placeholders must not include '?1'");
        }

        if(count($where) < 2){ $where[] = []; }

        $this->where = $where;

        return $this;
    }

    protected function addRecord( Array $record, $update_values = [] ) {
        list( $table, $columns, $values, $where ) = $record;

        if($update_values and is_array($update_values)) {
            return $this->db->insert( $table, $columns, $values, $update_values );
        }else{
            return $values ? $this->db->insertUnique( $table, $columns, $values, $where ) : null;
        }
    }

    protected function getRecord(string $id = '') {
        list($table, $columns) = $this->schema;
        if( ! array_search('id', $columns)){ $columns[] = 'id'; }

        $where = $id ? [ "deleted = 0 AND id = ?1", [$id] ] : [ "deleted = 0", [''] ];

        if($this->where) {
            $where[0] .= " AND ({$this->where[0]})";
            foreach ($this->where[1] as $var){ $where[1][] = $var; }

            $this->where = [];
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

