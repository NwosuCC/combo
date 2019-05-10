<?php

$countries = (new Country())->get()->all();

$leagues = (new League())->get()->all();

$clubs = (new Club())->get()->all();

$matches = (new Match())->get()->all();

$bets = (new Bet())->get()->all();

$tickets = (new Ticket())->withBookings();


[$bookings, $groups] = (new Test())->run_PA(3);

// ToDo: implement Data Source
$items = [
    [
        'match' => 'CHL -:- ARS', 'bet' => '1X', 'odd' => '1.85', 'code' => '47925', 'won' => true,
        'com' => ['1' => 'Orc', '2' => 'Chan', '3' => 'Ybo'],
        'rating' => [
            'score' => 23, 'min' => 4, 'arcade' => '0.05',
            'odds' => [
                ['1' => 'AG', '2' => 'DP'], ['1' => 'CF', '2' => 'JX']
            ]
        ]
    ],
    [
        'match' => 'MCT -:- WBA', 'bet' => '1 -1', 'odd' => '2.25', 'code' => '28049', 'won' => false,
        'com' => ['1' => 'Igloo', '2' => 'Panther', '3' => 'Mangonel'],
        'rating' => [
            'score' => 92, 'min' => 1, 'arcade' => '2.4',
            'odds' => [
                ['1' => 'HK', '2' => 'AO'], ['1' => 'WM', '2' => 'QI']
            ]
        ]
    ],
    [
        'match' => 'LIV -:- CAR', 'bet' => '1O2.5', 'odd' => '1.6', 'code' => '94268', 'won' => '3.5',
        'com' => ['1' => 'Trebuchet', '2' => 'Ram', '3' => 'Cavalier'],
        'rating' => [
            'score' => 85, 'min' => 3, 'arcade' => '1.12',
            'odds' => [
                ['1' => 'OF', '2' => 'EJ'], ['1' => 'CI', '2' => 'MD']
            ]
        ]
    ],
];

$opts = ['runSample' => 0];

$games = ['count' => 9];

$labels = ['Match', /*'Code',*/ 'Bet', 'Odd'];


// Ajax Response Data
echo json_encode(
    compact(
        'items',
        'opts',
        'games',
        'labels',
        'countries',
        'leagues',
        'clubs',
        'matches',
        'bets',
        'tickets',
        'bookings',
        'groups'
    )
);

exit();
