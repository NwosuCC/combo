<?php
/*
 * Very basic DB library; secure still.
 */

class DB {
    private static $connection;
    private $sql_string, $result, $rows = [];
    private $id_only = false;

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
            '02' => static::$connection->error."; \nProblem with Query \"{$this->sql_string}\"\n\n",
        ];

        if(empty($codes[$code])){ $code = '01'; }
//        die(json_encode(['code' => $code, 'error' => $codes[$code]]));
        throw new Error($codes[$code], $code);
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
        if ($this->result = static::$connection->query($this->sql_string)){
            return $this;
        }

        $this->throwError('02');
    }

    public function queryString() {
        return $this->sql_string;
    }

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
        if( ! $where or !is_array($where)){ return ''; }

        if(count($where) < 2){ $where[] = []; }

        list($whereString, $vars) = $where;

        foreach ($vars as $index => $var){
            $pos_value = strpos($whereString, '?');
            $pos_query = strpos($whereString, '?q');
            $is_query = ($pos_value === $pos_query);

            if(! $is_query){
                list($var) = $this->add_single_quotes( $this->escape([$var]) );
            }

            $search = $is_query ? '?q' : '?';
            $whereString = str_replace($search.($index + 1), $var, $whereString);
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

    public function all(){
        $this->run_sql()->fetch();
        return $this->rows;
    }

    public function first(){
        $this->run_sql()->fetch();
        return reset($this->rows);
    }

    public function last(){
        $this->run_sql()->fetch();
        return end($this->rows);
    }

    public function id() {
        $this->id_only = true;
        return $this;
    }

    public function getLastInsert($table, $columns = []){
        if( ! array_search('id', $columns)){ $columns[] = 'id'; }
        $where = ['id = LAST_INSERT_ID()'];
        return $this->select($table, $columns, $where)->first();
    }

    public function select($table, Array $columns, Array $where = []){
        if($this->id_only){
            $columns = ['id'];
            $this->id_only = false;
        }

        $columns = $columns ? $this->escape($columns) : ['*'];
        $columns = implode(',', $columns);

        $where = $where ? $this->where($where) : '';

        $this->sql_string = "SELECT {$columns} FROM {$table} {$where}";

        return $this;
    }

    public function insertUnique($table, Array $columns, Array $values, Array $where = []){
        $select_columns = $columns;
        if( ! array_search('id', $select_columns)){ $select_columns[] = 'id'; }

        $exists = $this->select($table, $select_columns, $where)->first();

        return $exists ?: $this->insert($table, $columns, $values);
    }

    public function insert($table, Array $columns, Array $values, Array $update_values = []){
        $this->validateVars('insert', [$columns, $values]);

        $insert_columns = implode(',', $this->escape($columns));
        $values = $this->escape($values);

        $allValues = [];
        foreach ($values as $value){
            $value = $this->add_single_quotes($this->escape($value));
            $allValues[] = '(' . implode(',', $value) . ')';
        }
        $allValues = implode(',', $allValues);

        $this->sql_string = "INSERT INTO {$table} ({$insert_columns}) VALUES {$allValues}";

        if($update_values){
            $allUpdateValues = [];

            foreach ($update_values as $column => $value){
                $value = $this->add_single_quotes($this->escape([$value]));
                $allUpdateValues[] = "$column = " . array_shift($value);
            }
            $allUpdateValues = implode(',', $allUpdateValues);

            $this->sql_string .= " ON DUPLICATE KEY UPDATE {$allUpdateValues}";
        }

        $this->run_sql();

        return $this->result ? $this->getLastInsert($table, $columns) : false;
    }

    public function update($table, Array $columnsValues, Array $where){
        $this->validateVars('update', [$columnsValues]);

        $allValues = [];   $result = 0;

        foreach ($columnsValues as $column => $value){
            $value = $this->add_single_quotes($this->escape([$value]));
            $allValues[] = "$column = " . array_shift($value);
        }
        $allValues = implode(',', $allValues);

        if($where = $where ? $this->where($where) : ''){
            $this->sql_string = "UPDATE {$table} SET {$allValues} {$where}";
            $this->run_sql();
            $result = static::$connection->affected_rows;
        }
        return $result;
    }

}

?>