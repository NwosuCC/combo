<?php

$result = [];

if(empty( $_POST['input'] )) {

    $result = ['error' => 'Unknown error!'];

}else{
    $post = $_POST;
    $input = $post['input'];

    switch ( $input ) {
        case 'country' : { $result = (new Country())->create($post); } break;
        case 'league' : { $result = (new League())->create($post); } break;
        case 'club' : { $result =  (new Club())->create($post); } break;
        case 'match' : { $result =  (new Match())->create($post); } break;
        case 'bet' : { $result =  (new Bet())->create($post); } break;
        case 'ticket' : { $result =  (new Ticket())->create($post); } break;
    }

    $result = [ 'data' => $result ];
}


// Ajax Response Data

die( json_encode( $result ) );

