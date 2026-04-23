<?php

namespace App\Enums;

enum FieldStage: string
{
    case Planted    = 'planted';
    case Germinated = 'germinated';
    case Growing    = 'growing';
    case Flowering  = 'flowering';
    case Maturing   = 'maturing';
    case Ready      = 'ready';
    case Harvested  = 'harvested';

    public function label(): string
    {
        return match($this) {
            self::Planted    => 'Planted',
            self::Germinated => 'Germinated',
            self::Growing    => 'Growing',
            self::Flowering  => 'Flowering',
            self::Maturing   => 'Maturing',
            self::Ready      => 'Ready to Harvest',
            self::Harvested  => 'Harvested',
        };
    }

    public function order(): int
    {
        return match($this) {
            self::Planted    => 1,
            self::Germinated => 2,
            self::Growing    => 3,
            self::Flowering  => 4,
            self::Maturing   => 5,
            self::Ready      => 6,
            self::Harvested  => 7,
        };
    }

    public function emoji(): string
    {
        return match($this) {
            self::Planted    => '🌱',
            self::Germinated => '🌿',
            self::Growing    => '🌾',
            self::Flowering  => '🌸',
            self::Maturing   => '🍃',
            self::Ready      => '✅',
            self::Harvested  => '🌾',
        };
    }

    /** Max expected days to reach the NEXT stage from this one */
    public function maxDaysInStage(): ?int
    {
        return match($this) {
            self::Planted    => 10,   // should germinate within 10 days
            self::Germinated => 21,   // should be visibly growing within 21 days
            self::Growing    => 30,   // should flower / mature within 30 days of last update
            self::Flowering  => 21,
            self::Maturing   => 30,
            self::Ready      => 7,    // harvest window — urgent
            self::Harvested  => null, // terminal stage
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
