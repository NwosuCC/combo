<?php

class Test {
    private $_archive;

    private $games_per_slip;
    private $slips;
    private $interval;

    public function __construct($games_per_slip = 7, $slips = 3, $interval = 3) {
        $this->games_per_slip = $games_per_slip;
        $this->slips = $slips;
        $this->interval = $interval;
    }

    public function run_PA(): array {
        return $this->run('PA'); // Partial Accumulator
    }

    private function run($type = ''): array {
        if( ! $type) { return []; }

        $Booking = new Booking($stake = 50);

        $n = 1;
        while($match = $this->getFixture($n, $n+1) and $n += 2 ) {
            $betProps = $this->getBet();
            $Booking->addGame($match, $betProps);
        }

        try {
            return $Booking->getPartialAccumulation(
             $this->games_per_slip, $this->slips, $this->interval
            );

        } catch (Error $error) {
            echo $error->getMessage();
            return [ [], [] ];
        }
    }

    private function getFixture($home_id, $away_id) {
        $home = (new Club( $home_id ));
        $home_league = $home->getLeague();

        $away = (new Club( $away_id ));
        $away_league = $away->getLeague();

        if($home_league and $away_league) {
            if($home_league->id() === $away_league->id()) {
//                return new Match($home_league, $home, $away);
            }
        }

        return null;
    }

    private function getOdd() {
        $decimal = (float) number_format(0.05 * abs(rand(0,19)), 2);
        $integer = $decimal >= 0.45 ? 1 : 2;
        return $integer + $decimal;
    }

    private function getBet() {
        $random_index_1 = array_rand(Model::BETS);
        $random_index_2 = array_rand( Model::BETS[$random_index_1] );

        $code = abs(rand(11111, 99999));
        $bet = Model::BETS[ $random_index_1 ][ $random_index_2 ];
        $odd = $this->getOdd();

        return compact('code', 'bet', 'odd');
    }

}

