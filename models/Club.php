<?php

class Club extends Model {
    protected $name = '';
    protected $_key = '';
    protected $code = '';
    protected $league = [];

    function __construct( $id = '' ) {
        parent::__construct( $this->schema() );

        if( $id and $record = $this->get( $id )->first() ) {
            $this->id = $record['id'];
            $this->name = $record['name'];
            $this->_key = $record['_key'];
            $this->code = $record['code'];
            $this->league = (new League( $record['id_league'] ));
        }
    }

    public function getName() { return $this->name; }

    public function getCode() { return $this->code; }

    public function getCountry() {
        return $this->getLeague()->getCountry();
    }

    public function getLeague() {
        if( $this->league and !is_object( $this->league ) ){
            $this->league = (new League( $this->league ));
        }
        return $this->league;
    }

    public function belongsTo(League $league) {
        if($this->getLeague()->id() !== $league->id()){
            throw new Error("League and Club do not match");
        }
        return true;
    }

    public function schema() {
        return [
            'club', ['_key', 'name', 'code', 'id_league']
        ];
    }

    public function create(Array $data) {
        list($table, $columns) = $this->schema();

        $values = [
            Utils::arraySliceParts(['key', 'name', 'code', 'league'], $data)
        ];

        $club_key = str_replace(' ', '', $values[0]['key']);

        $where = [
            "_key = ?1 AND deleted = 0", [ $club_key ]
        ];

        return $this->addRecord( [$table, $columns, $values, $where] );
    }

}