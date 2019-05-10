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

    private static $schema = [
        'ticket' => ['name', 'stake', 'status'],

        'booking' => ['id_match', 'id_bet', 'odd', 'id_ticket', 'pos', 'outcome']
    ];

}
