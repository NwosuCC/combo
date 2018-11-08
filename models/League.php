<?php

class League extends Model  {
    protected $name = '';
    protected $_key = '';
    protected $country = '';

    function __construct( $id = '' ) {
        parent::__construct( $this->schema() );

        if( $id and $record = $this->get( $id )->first() ) {
            $this->id = $record['id'];
            $this->name = $record['name'];
            $this->_key = $record['_key'];
            $this->country = $record['country'] = (new Country( $record['id_country'] ));
        }
    }

    public function getName() { return $this->name; }

    public function getCountry() {
        if( ! $this->country ) {
            throw new Error("Country not found: incorrect 'id' provided");
        }else if( !is_object( $this->country ) ){
            $this->country = (new Country( $this->country ));
        }
        return $this->country;
    }

    public function belongsTo(Country $country) {
        if($this->getCountry()->id() !== $country->id()){
            throw new Error("Country and League do not match");
        }
        return true;
    }

    public function hasClub(Club $club) {
        return ($name = $this->getName()) and $club->getLeague()->getName() === $name;
    }

    public function schema() {
        return [
            'league', ['_key', 'name', 'id_country']
        ];
    }

    public function create(Array $data) {
        list($table, $columns) = $this->schema();

        $values = [
            Utils::arraySliceParts(['key', 'name', 'country'], $data)
        ];

//        $country = $values[0]['country'];
        $league_key = $values[0]['key'];
        $name = $values[0]['name'];

//        $country_model = (new Country())->find( $country )->queryString();

        $where = [
//            "_key = ?1 AND deleted = 0 AND id_country = ( ?q2 )", [ $league_key, $country_model ]
            "(_key = ?1 OR name = ?2) AND deleted = 0", [ $league_key, $name ]
        ];

        return $this->db->insertUnique( $table, $columns, $values, $where );
    }


}