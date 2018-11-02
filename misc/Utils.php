<?php

class Utils {

    public static function pr(Array $var) {
        foreach ($var as $key => $value) {
            echo $key . ': ' . json_encode($value); echo '<br>';
        }
        echo '<br>';
        echo '===================================================================================================';
        echo '<br>';
    }

    public static function toTwoDPs($number) {
        return number_format($number, 2);
    }

    public static function toJson($value) {
        echo json_encode($value);
    }

    public static function fromJson($value) {
        echo json_decode($value);
    }

    public static function arraySliceParts($parts, $array, $remove = false){
        if($remove){
            $parts = array_diff( array_keys($array), $parts );
        }
        extract($array);
        return compact($parts);
    }

}
