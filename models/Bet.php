<?php

class Bet extends Model {
    private $code, $description;

    public function __construct( $id = '' ) {
        parent::__construct( $this->schema() );

        if( $id and $record = $this->get( $id )->first() ) {
            $this->id = $record['id'];
            $this->code = $record['code'];
            $this->description = $record['description'];
        }
    }

    public function schema() {
        return [
            'bet', ['code', 'description']
        ];
    }

    public function create(Array $data) {
        list($table, $columns) = $this->schema();

        $values = [
            Utils::arraySliceParts(['code', 'description'], $data)
        ];

        if( ! Utils::validateInput($values)){
          return false;
        }

        $code = $values[0]['code'];

        $where = [
            "code = ?1 AND deleted = 0", [ $code ]
        ];

        return $this->db->insertUnique( $table, $columns, $values, $where );
    }

}