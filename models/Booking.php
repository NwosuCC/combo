<?php

class Booking extends Model {
    private $ticket;
    private $stake;

    private $games = [];

    public function __construct( $id = '' ) {
        parent::__construct( $this->schema() );

        if( $id and $record = $this->get( $id )->first() ) {
            $this->id = $record['id'];
            $this->ticket = $record['ticket'];
            $this->stake = $record['stake'];
        }
    }

    public function addGame(Match $match, array $props) {
        $this->games[] = [
            'country' => $match->getLeague()->getCountry(),
            'league' => $match->getLeague()->getName(),
            'match' => $match->label(),
            'code' => $props['code'],
            'bet' => $props['bet'],
            'odd' => $props['odd'],
        ];
    }

    public function getTickets(): array {
        $all_records = $this->get()->all();
        $bookings = [];

        foreach ($all_records as $i => $row) {
            $name = $row['ticket'];
            $bookings[$name][] = $row;
        }
        return array_values( $bookings );
    }

    public function getGames(): array {
        return $this->games;
    }

    public function gamesCount(): int {
        return count($this->games);
    }

    /*public function getCombinations(int $r): array {
        $n = $this->gamesCount();
        // do combinations: n C r = n! / (r! * (n-r)!)
        return [];
    }*/

    public function getPartialAccumulation(int $games_per_slip = 0, int $slips = 1, int $interval = 0): array {
        $matches = $this->getGames();
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

                $group_cumulative_odds *= $matches[ $odd_index ]['odd'];

                $matches[ $odd_index ]['groups'][$name][ $odd_index + 1 ] = [
                    'odd_index' => $odd_index,
                    'marker' => ($offset === 0) ? '[x]' : 'x',
                    'cumulative_odds' => $group_cumulative_odds,
                    'cumulative_amount' => $group_cumulative_odds * $this->stake,
                ];

                $group[$odd_index + 1] = $matches[ $odd_index ]['groups'][$name][ $odd_index + 1 ];
            }
        }

        return [$matches, $groups];
    }

    public function schema() {
        return [
            'booking', ['ticket', 'stake', 'id_match', 'bet', 'odd', 'status']
        ];
    }

    public function create(Array $data) {
        $count = $data['count'];
        $stake = $data['stake'];

        if($count > 12){
            throw new Error("Cannot push more than 12 bookings at a time");
        }else if($stake < 50) {
            throw new Error("Minimum stake is 50");
        }

        $result_set = [];

        for($n = 1; $n <= $count; $n++) {
            $match = (new Match( $data["match_{$n}"] ));

            if( $match->id() and ! $match->isStarted() ){
                list($table, $columns) = $this->schema();

                $props = ['ticket', 'stake', "match_{$n}", "bet_{$n}", "odd_{$n}"];
                $values = [ Utils::arraySliceParts($props, $data) ];
                $values[0][] = '0'; // status

                $id_match = $values[0]["match_{$n}"];
                $ticket = $values[0]["ticket"];

                $where = [
                    "id_match = ?1 AND ticket = ?2 AND deleted = 0", [ $id_match, $ticket ]
                ];

                $result_set[] = $this->addRecord( [$table, $columns, $values, $where] );
            }
        }

        return $result_set;
    }

}