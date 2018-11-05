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
        return [
            'booking', ['id_match', 'id_bet', 'odd', 'id_ticket', 'outcome']
        ];
    }

    public function create( Ticket $ticket, Array $data ) {
        $count = $data['count'];
        $ticket_name = $data['name'];
        $ticket_id = $ticket->id();

        if( !$ticket or !$ticket_id or $ticket_name !== $ticket->getName() ) {
            throw new Error("Ticket with name [{$ticket_name}] not found");
        }

        list($table, $columns) = $this->schema();
        $result_set = [];

        for($n = 1; $n <= $count; $n++) {
            $match = (new Match( $data["match_{$n}"] ));

            if( $match->id() and ! $match->isStarted() ){

                $values = [ Utils::arraySliceParts(["match_{$n}", "bet_{$n}", "odd_{$n}"], $data) ];
                $values[0]['id_ticket'] = $ticket_id;
                $values[0]['outcome'] = '0';

                $id_match = $values[0]["match_{$n}"];
                $id_bet = $values[0]["bet_{$n}"];
                $odd = $values[0]["odd_{$n}"];

                $update_values = [
                    'id_match' => $id_match, 'id_bet' => $id_bet, 'odd' => $odd,
                ];

                $where = [
                    "id_match = ?1 AND id_ticket = ?2 AND deleted = 0", [ $id_match, $ticket_id ]
                ];

                $result_set[] = $this->addRecord( [$table, $columns, $values, $where], $update_values );

                Utils::pr([
                    '$update_values' => $update_values,
                    '$where' => $where,
                    '$result_set' => $result_set,
                ]);
            }
        }

        return $result_set;
    }

}