<?php

class Ticket extends Model {
    private $name;
    private $stake;
    private $bookings = [];

    public function __construct( $id = '' ) {
        parent::__construct( $this->schema() );

        if( $id and $record = $this->get( $id )->first() ) {
            $this->id = $record['id'];
            $this->name = $record['name'];
            $this->stake = $record['stake'];
            $ticket = $this->withBookings( $this->id );
            $this->bookings = ($ticket and !empty($ticket[0]['bookings'])) ? $ticket[0]['bookings'] : [];
        }
    }

    public function getName() {
      return $this->name;
    }

    public function withBookings( $id = '' ): array {
        $records = $this->get( $id )->all();
        $tickets = [];

        $placeholders = [];  $id_vars = [];

        foreach ($records as $i => $row) {
            $placeholders[] = '?'.($i + 1);
            $id_vars[] = $row['id'];
            $tickets[ $row['id'] ] = $row;
        }

        $whereClause = 'id_ticket IN ('. implode(',', $placeholders) .')';
        $where = [ $whereClause, $id_vars ];

        $bookings = (new Booking())->where( $where )->get()->limit(50);

        foreach ($bookings as $i => $row) {
            $id_ticket = $row['id_ticket'];
            $tickets[ $id_ticket ]['bookings'][] = $row;
        }

        return array_values( $tickets );
    }

    public function gamesCount(): int {
        return count( $this->getGames() );
    }

    public function getGames(): array {
        return $this->bookings;
    }

    public function getCombinations(int $r): array {
        $n = $this->gamesCount();

        // do combinations: n C r = n! / (r! * (n-r)!)

        return [];
    }

    public function getPartialAccumulation(int $games_per_slip = 0, int $slips = 1, int $interval = 0): array {
        $bookings = $this->getGames();
        $total_count = $this->gamesCount();
        $groups = [];

        if($slips === 1 && $games_per_slip === 0) {
            $games_per_slip = $total_count;
        }

        if($slips < 1 or $games_per_slip < 0 or $interval < 0) {
            $error = 'Minimum values: [slips] = 1, [games_per_slip] = 0, [interval] = 0';
            $code = 2;
            throw new Error($error, $code);

        }else if($this->gamesCount() < $games_per_slip) {
            $error = 'Supplied [games_per_slip] ('.$games_per_slip.') exceeds the available games ('.$total_count.')';
            $code = 3;
            throw new Error($error, $code);

        }else if( ($int = $interval > $games_per_slip) or ($slp = $slips > $games_per_slip) ) {
            $param = $int ? '[interval] ('.$interval.')' : '[slips] ('.$slips.')';
            $error = 'Supplied '. $param . ' exceeds the supplied [games_per_slip] ('.$games_per_slip.')';
            $code = 3;
            throw new Error($error, $code);
        }

        for ($slip_index = 0; $slip_index < $slips; $slip_index++) {
            $name = chr(65 + $slip_index);
            $first_odd_index = $slip_index * $interval;
            $groups[] = $name;

            $from_zero = 0;
            $group_cumulative_odds = 1;

            $group = [];

            for ($offset = 0; $offset < $games_per_slip; $offset++) {
                $current_pos = $first_odd_index + $offset;
                $odd_index = $current_pos < $total_count ? $current_pos : ($from_zero++);

                $group_cumulative_odds *= $bookings[ $odd_index ]['odd'];

                $bookings[ $odd_index ]['groups'][$name][ $odd_index + 1 ] = [
                    'odd_index' => $odd_index,
                    'marker' => ($offset === 0) ? '[x]' : 'x',
                    'cumulative_odds' => $group_cumulative_odds,
                    'cumulative_amount' => $group_cumulative_odds * $this->stake,
                ];

                $group[$odd_index + 1] = $bookings[ $odd_index ]['groups'][$name][ $odd_index + 1 ];
            }
        }

        return [$bookings, $groups];
    }

    public function schema() {
        return Schema::get('ticket');
    }

    public function create(Array $data) {
        $count = $data['count'] or 0;
        $stake = $data['stake'] or 0;
        $ticket_id = $data['id'];
        $name = $data['name'];

        if($count > 12) {
            throw new Error("Cannot push more than 12 bookings at a time");  // remove this
        }else if($stake < 50) {
            throw new Error("Minimum stake is 50");
        }

        list($table, $columns) = $this->schema();

        $values = [ Utils::arraySliceParts(['name', 'stake'], $data) ];
        $values[0]['status'] = '0';

        $where = [ "id = ?1 AND deleted = 0", [$ticket_id] ];

        $result = false;

        try {
            $insert = $result = $this->db->insertUnique( $table, $columns, $values, $where );
        }
        catch (Error $e) {}

        if(empty($insert)) {
            $update_values = [ 'name' => $name, 'stake' => $stake ];

            if( ! $update = $result = $this->db->update( $table, $update_values, $where )) {
                $current_where = [ "id = ?1 AND name = ?2 AND deleted = 0", [$ticket_id, $name] ];

                $result = $this->db->select( $table, $columns, $current_where )->first();
            }
        }

        if( $result ) {
            $ticket = new Ticket( $result['id'] );

            if($booking = (new Booking())->create( $ticket, $data )) {
                $result = $this->withBookings( $result['id'] );
            }
        }

        return $result;
    }

}