<?php

class Match extends Model {
    protected $league;
    protected $homeTeam;
    protected $awayTeam;

    protected $stadium;
    protected $date;
    protected $time;

    private $goals = ['1' => 0, '2' => 0];

    function __construct( $id = '' ) {
        parent::__construct( $this->schema() );

        if( $id and $record = $this->get( $id )->first() ) {
            $this->id = $record['id'];
            $this->league = (new League( $record['id_league'] ));
            $this->homeTeam = (new Club( $record['id_club_1'] ));
            $this->awayTeam = (new Club( $record['id_club_2'] ));
            $this->stadium = $record['id_stadium'];
            $this->date = $record['date'];
            $this->time = $record['time'];
        }
    }

    public function getLeague(): League { return $this->league; }

    public function getStadium(): array  { return $this->stadium; }

    public function getKickOffTime(): array  { return $this->time; }

    public function getHomeTeam(): Club  { return $this->homeTeam; }

    public function getAwayTeam(): Club  { return $this->awayTeam; }

    public function isStarted(): bool  {
//        return time() > $this->time;  // convert time to seconds
        return false;
    }

    public function isFinished(): bool  {
//        return time() > ($this->time + (90*60));  // convert time to seconds
        return false;
    }

    public function getResult(): array  {
        return $this->isStarted() ? $this->goals : ['-','-'];
    }

    public function getScore(): string  {
        [$home, $away] = array_values( $this->getResult() );
        return join(':', [$home, $away]);
    }

    public function label(): string  {
        $home = $this->homeTeam->getCode();
        $away = $this->awayTeam->getCode();
        $score = $this->getScore();

        return join(' ', [$home, $score, $away]);
    }

    public function schema() {
        return [
            'matches', ['season', 'id_club_1', 'id_club_2', 'id_league', 'date', 'time', 'status', 'id_stadium']
        ];
    }

    public function create(Array $data)
    {
      if( ! Utils::validateInput($data)){
        return false;
      }

      $country = (new Country( $data['country'] ));
        $league = (new League( $data['league'] ));

        $datetime = trim( $data['date'] . ' ' . $data['time'] );
        $match_year = $datetime ? date_create($datetime)->format('Y') : '';
        $season_years = array_map(function($var){ return trim($var); }, explode('/', $data['season']) );

        if($league->belongsTo($country) and in_array($match_year, $season_years)){
            list($table, $columns) = $this->schema();

            $props = [
                'season', 'home', 'away', 'league', 'date', 'time', 'stadium'
            ];
            $values = [ Utils::arraySliceParts($props, $data) ];
            $values[0][] = '0';

            $season = $values[0]['season'];
            $home_team = $values[0]['home'];
            $away_team = $values[0]['away'];
            $league = $values[0]['league'];

            $where = [
                "id_club_1 = ?1 AND id_club_2 = ?2 AND id_league = ?3 AND season = ?4 AND deleted = 0",
                [ $home_team, $away_team, $league, $season ]
            ];

            return ($home_team !== $away_team) ? $this->db->insertUnique( $table, $columns, $values, $where ) : false;
        }

        return [];
    }

}