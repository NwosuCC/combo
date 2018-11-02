<?php

class Country extends Model {
    protected $name = ''; // for UEFA, name = 'International Clubs', etc

    function __construct( $id = '' ) {
        parent::__construct( $this->schema() );

        if( $id and $record = $this->get( $id )->first() ) {
            $this->id = $record['id'];
            $this->name = $record['country'];
        }
    }

    public function getName() { return $this->name; }

    public function hasLeague(League $league) {
        return ($name = $this->getName()) and $league->getCountry() === $name;
    }

    public function hasClub(Club $club) {
        return ($name = $this->getName()) and $club->getCountry()->getName() === $name;
    }

    public function schema() {
        return [
            'country', ['country', 'nationality', 'iso_code', 'phone_code']
        ];
    }

    public function create(Array $data) {
        list($table, $columns) = $this->schema();

        $values = [
            Utils::arraySliceParts($columns, $data)
        ];

        $country = $values[0]['country'];

        $where = [
            "country = ?1 AND deleted = 0", [ $country ]
        ];

        return $this->addRecord( [$table, $columns, $values, $where] );
    }

}