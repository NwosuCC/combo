<?php

class Model {

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
        return $this->get( $id )->id();
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

        if(count($where) < 2){ $where[] = []; }

        $this->where = $where;

        return $this;
    }

    protected function getRecord(string $id = '') {
        list($table, $columns) = $this->schema;
        if( ! array_search('id', $columns)){ $columns[] = 'id'; }

        $where = [ '', [] ];

        if($this->where) {
            $where[0] = "{$this->where[0]}";
            foreach ($this->where[1] as $var){ $where[1][] = $var; }
            $this->where = [];
        }

        if($id) {
            if( $where[0] ){ $where[0] .= " AND"; }
            $i = count($where[1]) + 1;
            $where[0] .= " id = ?{$i}";
            $where[1][] = $id;
        }

        if( $where[0] ){ $where[0] .= " AND"; }
        $where[0] .= " deleted = 0";

        $this->db->select($table, $columns, $where);

        return $this->db;
    }


}

