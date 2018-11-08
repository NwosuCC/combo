<?php

class Booking extends Model {
    private $ticket, $match, $bet, $odd;

    public function __construct( $id = '' ) {
        parent::__construct( $this->schema() );

        if( $id and $record = $this->get( $id )->first() ) {
            $this->id = $record['id'];
            $this->ticket = $record['id_ticket'];
            $this->match = $record['id_match'];
            $this->bet = $record['id_bet'];
            $this->odd = $record['odd'];
        }
    }

    public function schema() {
        return Schema::get('booking');
    }

    public function create( Ticket $ticket, Array $data ) {
        $name = $data['name'];
        $ticket_id = $ticket->id();

        if( !$ticket or !$ticket_id or !$name or $name !== $ticket->getName() ) {
            throw new Error("Ticket [{$name}] not found");
        }

        list($table, $columns) = $this->schema();
        $result_set = [];  $n = 0;

        while( ++$n < 100 and array_key_exists("match_{$n}", $data)) {
            $match = (new Match( $data["match_{$n}"] ));

            if( $match->id() and ! $match->isStarted() ){

                $values = [ Utils::arraySliceParts(["match_{$n}", "bet_{$n}", "odd_{$n}"], $data) ];
                $values[0]['id_ticket'] = $ticket_id;
                $values[0]['pos'] = $n;
                $values[0]['outcome'] = '0';

                $id_match = $values[0]["match_{$n}"];
                $id_bet = $values[0]["bet_{$n}"];
                $odd = $values[0]["odd_{$n}"];

                $update_values = [
                    'id_match' => $id_match, 'id_bet' => $id_bet, 'odd' => $odd,
                ];

                $where = [
                    "id_ticket = ?1 AND pos = ?2 AND deleted = 0", [ $ticket_id, $n ]
                ];

                $result_set[] = $this->db->insertOrUpdate( $table, $columns, $values, $update_values );
            }
        }

        return $result_set;
    }

}