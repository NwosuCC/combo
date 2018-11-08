<?php

abstract class Schema {

    public static function get( $name ) {
        if( ! $name or ! array_key_exists( $name, self::$schema )) {
            throw new Error("Schema [{$name}] not found");
        }

        return [ $name, self::$schema[ $name ] ];
    }

    public static function all() {
        return self::$schema;
    }

    /*public static function set( $table, Array $columns ) {
        preg_match("[^A-z0-9_]", $table, $invalid_characters);

        if( ! $table or $invalid_characters ) {
            throw new Error("Schema table name [{$table}] is required");
        }
        else if( $invalid_characters ) {
            throw new Error("Schema table name [{$table}] must not contain {$invalid_characters}");
        }
        else if ( ! $columns ) {

        }

    }*/

    private static $schema = [
        'ticket' => ['name', 'stake', 'status'],

        'booking' => ['id_match', 'id_bet', 'odd', 'id_ticket', 'pos', 'outcome']
    ];

}
