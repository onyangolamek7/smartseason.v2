<?php

namespace App\Enums;

enum FieldStatus: string
{
    case Active    = 'active';
    case AtRisk    = 'at_risk';
    case Critical  = 'critical';
    case Completed = 'completed';
    case Abandoned = 'abandoned';

    public function label(): string
    {
        return match($this) {
            self::Active    => 'Active',
            self::AtRisk    => 'At Risk',
            self::Critical  => 'Critical',
            self::Completed => 'Completed',
            self::Abandoned => 'Abandoned',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::Active    => 'green',
            self::AtRisk    => 'amber',
            self::Critical  => 'red',
            self::Completed => 'gray',
            self::Abandoned => 'stone',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
