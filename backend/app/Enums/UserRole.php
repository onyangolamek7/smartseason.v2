<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin      = 'admin';
    case FieldAgent = 'field_agent';

    public function label(): string
    {
        return match($this) {
            self::Admin      => 'Admin',
            self::FieldAgent => 'Field Agent',
        };
    }
}
