<?php
/*
 * Very basic DB library; secure still.
 */

class DB {
    private static $connection;
    private $sql_string = '', $result, $rows = [];

    public function __construct(){
        $host = $user = $password = $db = '';
        extract($_ENV['database']);
        static::$connection = new MySQLi($host, $user, $password, $db);
    }

    private function escape(Array $values){
        $escaped_values = [];
        foreach($values as $key => $value){
            if(is_array($value)){
                $escaped_values[$key] = $this->escape($value);
            }else{
                $value = stripslashes(htmlspecialchars(trim($value)));
                $escaped_values[$key] = static::$connection->real_escape_string($value);
            }
        }
        return $escaped_values;
    }

    private function throwError($code){
        $codes = [
            '01' => 'DB operation failed!',
            '02' => static::$connection->error."; \nProblem with Query \"{$this->queryString()}\"\n\n",
        ];

        if(empty($codes[$code])){ $code = '01'; }
//        die(json_encode(['code' => $code, 'error' => $codes[$code]]));
        throw new Error( $codes[$code], $code );
    }

    private function validateVars($queryType, $vars){
        switch ($queryType) {
            case 'insert' : {
                list($columns, $values) = $vars;
                if(empty($columns) or !is_array($columns) or empty($values) or !is_array($values)
                    or !is_array($values[0]) or count($columns) !== count($values[0])){
                    $error = 'DB::insert() requires valid Array $columns and Array $values.';
                    $syntax1 = 'Array $columns: ["fruit","tally","isFavourite"]';
                    $syntax2 = 'Array $values: [ ["pear",23,false], ["apple",57,true], ["orange",30,true] ]';
                }
            } break;

            case 'update' : {

            }

            default : {}
        }
    }

    private function run_sql(){
        if ($this->result = static::$connection->query( $this->sql_string )){
            $this->queryString();
            return $this;
        }

        $this->throwError('02');
    }

    private function run_multi_sql(Array $queries, Array $labels = [], $use_result = false){
//        if(!is_array($queries)){ $queries = explode(';', $queries); }
        if( trim( end($queries) ) == ''){ array_pop($queries); }
        $queriesCount = count($queries);

//        if(!is_array($labels)){ $labels = explode(',', $labels); }
        if( trim( end($labels) ) == ''){ array_pop($labels); }
        $labelsCount = count($labels);

        if($use_result and !empty($labels) and $queriesCount != $labelsCount){
            die('Function run_multi_sql(): Number of "Queries" in @param $queries' .
                ' must match Number of "Labels" provided in @param $labels');
        }

        $this->sql_string = implode(';', $queries);
        
        /*$this->sql_string = "SELECT * FROM settings WHERE name = 'withdrawal' AND sub1 = 'fee' AND sub2 = 'percent' ;
SELECT * FROM settings WHERE name = 'withdrawal' AND sub1 = 'fee' AND sub2 = 'amount' ;
SELECT * FROM settings WHERE name = 'withdrawal' AND sub1 = 'limit' AND sub2 = 'minimum' ;
SELECT * FROM settings WHERE name = 'withdrawal' AND sub1 = 'limit' AND sub2 = 'maximum';";*/

        $fetch = [];

        if($aa = static::$connection->multi_query( $this->sql_string )){
            
            do {
                if($this->result = static::$connection->store_result()){
                    $group = (isset($group)) ? ++$group : 0;

                    while($row = $this->result->fetch_assoc()){
                        if($use_result){
                            $key = !empty($labels) ? $labels[$group] : $group;
                            $fetch[ $key ] = [$row];
                        }else{
                            $fetch = $group + 1;
                        }
                    }

                    if( !isset($fetch) ){ $fetch = false; }

                    $this->result->free();
                }
                
            } while(static::$connection->more_results() and static::$connection->next_result());

            if(isset($fetch)){
                return $fetch;
                
            }else{
                //  For operations like 'CREATE Table' which return (bool) FALSE on both 'Success' and 'Failure'
                return (static::$connection->error == '') ? true : null;
            }
            
        }else{
            $this->throwError('02');
        }
    }

    public function queryString() {
        $sql_string = $this->sql_string;
        $this->sql_string = '';

        return $sql_string;
    }

    /* Example usage: Shows usage of the 'q|' modifier ( also implemented in 'DB::where()' method )
     *  $delivery = "IF( MINUTE( TIMEDIFF(now(), created_at) ) BETWEEN 1 AND 2, 1, delivery)";
        $update_values = [
            'p_total' => $total, 'p_current' => $current, 'hits' => 'q|hits + 1',
            'count' => $reviewsCount, 'delivery' => "q|$delivery"
        ];
     */
    private function add_single_quotes(Array $values){
        foreach($values as $key => $value){
            $quote_index = strpos($value,"'");
            $slash_index = strpos($value,"\\");
            if($quote_index !== false and ($quote_index - 1) !== $slash_index){
                $values = false;  break;
            }
            $vars = explode('|', $value);
            $value = array_pop($vars);
            $values[$key] = !in_array('q', $vars) ? "'{$value}'" : $value;
        }
        return $values;
    }

    private function where(Array $where){
        if( !$where){
            throw new Error('where() Example: [ "name = ?1 OR email = ?2", [$name, $email] ]');
        }

        if(count($where) < 2){ $where[] = []; }

        list($whereString, $vars) = $where;

        foreach ($vars as $index => $var){
            $pos_value = strpos($whereString, '?');
            $pos_query = strpos($whereString, '?q');
            $is_query = ($pos_query !== false and $pos_value === $pos_query);

            if( ! $is_query ){
                list($var) = $this->add_single_quotes( $this->escape([$var]) );
            }

            $number = ($index + 1);
            $pattern = "/\?[q]?{$number}([^0-9]|$)/";

            $n = 0;  $max_n = 100;

            while( preg_match($pattern, "$whereString", $matches) ) {
                $whereString = str_replace($matches[0], ($var.$matches[1]), $whereString);
                if(++$n > $max_n) {
                    throw new Error("Specified maximum reasonable iterations ($max_n) exceeded");
                }
            }
        }

        return $where ? "WHERE {$whereString}" : '';
    }

    private function fetch(){
        if($this->result){
            $this->rows = [];
            while($row = $this->result->fetch_assoc()){
                $this->rows[] = $row;
            }
        }
    }

    public function limit( int $length, int $start = 0 ){
        $this->sql_string .= " LIMIT {$start}, {$length}";
        $this->run_sql()->fetch();
        return $this->rows;
    }

    public function all(){
        $this->run_sql()->fetch();
        return $this->rows;
    }

    public function id() {
        $row = $this->first();
        return $row ? [ 'id' => $row['id'] ] : null;
    }

    public function first(){
        $this->run_sql()->fetch();
        return reset($this->rows);
    }

    public function last(){
        $this->run_sql()->fetch();
        return end($this->rows);
    }

    public function getLastInsert($table, $columns = []){
        $where = ['id = LAST_INSERT_ID()'];
        return $this->select($table, $columns, $where);
    }

    public function select($table, Array $columns, Array $where = []){
        if( ! array_search('id', $columns)){ $columns[] = 'id'; }

        $columns = $columns ? $this->escape($columns) : ['*'];
        $columns = implode(',', $columns);

        $where = $where ? $this->where($where) : '';

        $this->sql_string = "SELECT {$columns} FROM {$table} {$where}";

        return $this;
    }

    public function insertUnique($table, Array $columns, Array $values, Array $where = []){
        $select_columns = $columns;
        if( ! array_search('id', $select_columns)){ $select_columns[] = 'id'; }

        $record = $this->select($table, $select_columns, $where)->first();

        return $record ? false : $this->insert($table, $columns, $values);
    }

    public function insertOrUpdate($table, Array $columns, Array $values, Array $update_values){
        if( !$update_values) {
            throw new Error('insertOrUpdate() requires parameter [Array $update_values]');
        }

        $allUpdateValues = [];

        foreach ($update_values as $column => $value){
            $value = $this->add_single_quotes($this->escape([$value]));
            $allUpdateValues[] = "$column = " . array_shift($value);
        }
        $allUpdateValues = implode(',', $allUpdateValues);

        $this->sql_string = " ON DUPLICATE KEY UPDATE {$allUpdateValues}";

        return $this->insert($table, $columns, $values);
    }

    public function insert($table, Array $columns, Array $values){
        $this->validateVars('insert', [$columns, $values]);

        $insert_columns = implode(',', $this->escape($columns));
        $values = $this->escape($values);

        $allValues = [];
        foreach ($values as $value){
            $value = $this->add_single_quotes($this->escape($value));
            $allValues[] = '(' . implode(',', $value) . ')';
        }
        $allValues = implode(',', $allValues);

        $sql_string = "INSERT INTO {$table} ({$insert_columns}) VALUES {$allValues}";

        $this->sql_string = $sql_string . $this->sql_string;

        $this->run_sql();

        return $this->result ? $this->getLastInsert($table, $columns)->first() : false;
    }

    public function update(string $table, Array $updates, Array $where) {
        $this->validateVars('update', [$updates]);

        $columns_values = [];

        foreach ($updates as $column => $value){
            $value = $this->add_single_quotes($this->escape([$value]));
            $columns_values[] = "$column = " . array_shift($value);
        }
        $columns_values = implode(',', $columns_values);

        $columns_values = "id = LAST_INSERT_ID(id), " . $columns_values;

        if($where = $where ? $this->where($where) : ''){
            $this->sql_string = "UPDATE {$table} SET {$columns_values} {$where}";

            $this->run_sql();

            if($result = static::$connection->affected_rows) {
                list($table, $columns) = Schema::get($table);
                return $this->getLastInsert($table, $columns)->first();
            }
        }

        return false;
    }

}

?>