<?php

class Test {

    private $games_per_slip;
    private $slips;
    private $interval;

    public function __construct($games_per_slip = 7, $slips = 3, $interval = 3) {
        $this->games_per_slip = $games_per_slip;
        $this->slips = $slips;
        $this->interval = $interval;
    }

    public function run_PA($ticket_id = '3'): array {
        // Partial Accumulator
        return $this->run($ticket_id, 'PA');
    }

    private function run($ticket_id, $type = ''): array {
        $dummy = [ [], [] ];

        if( ! $type) { return $dummy; }

        list($games_per_slip, $slips, $interval) = [ $this->games_per_slip, $this->slips, $this->interval ];

        if($ticket = new Ticket($ticket_id) and $ticket->id()) {
            try {
                switch ($type) {
                    case 'PA' : {
                        return $ticket->getPartialAccumulation( $games_per_slip, $slips, $interval );
                    } break;
                }
            } catch (Error $error) {}
        }
        return $dummy;
    }


}

