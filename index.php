<?php
include_once 'env.php';

include_once 'misc/Test.php';
include_once 'misc/Utils.php';
include_once 'misc/Dates.php';
include_once 'misc/Schema.php';
include_once 'misc/DB.php';
//include_once 'misc/DB_PDO.php';


include_once 'models/Model.php';

include_once 'models/Country.php';
include_once 'models/League.php';
include_once 'models/Club.php';
include_once 'models/Match.php';

include_once 'models/Ticket.php';
include_once 'models/Booking.php';
include_once 'models/Bet.php';

Dates::setTimezone( $_ENV['timezone'] );


if(isset($_GET['data'])) {

    include_once 'data.php';

}
else if(isset($_POST['input'])) {

    include_once 'input.php';

}
