<?php

namespace App\Models;

use App\Enums\FieldStage;
use App\Enums\FieldStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Model;

class Field extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'crop_type',
        'planting_date',
        'expected_harvest_date',
        'stage',
        'assigned_agent_id',
        'location',
        'area_hectares',
        'notes',
        'is_abandoned',
    ];

    protected function casts(): array
    {
        return [
            'planting_date'         => 'date',
            'expected_harvest_date' => 'date',
            'stage'                 => FieldStage::class,
            'is_abandoned'          => 'boolean',
        ];
    }

    //Relationships

    public function assignedAgent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_agent_id');
    }

    public function updates(): HasMany
    {
        return $this->hasMany(FieldUpdate::class);
    }

    public function latestUpdate(): HasOne
    {
        return $this->hasOne(FieldUpdate::class)->latestOfMany();
    }

    //Computed Status

    public function getStatusAttribute(): FieldStatus
    {
        if ($this->is_abandoned) return FieldStatus::Abandoned;
        if ($this->stage === FieldStage::Harvested) return FieldStatus::Completed;

        $now        = now();
        $lastUpdate = $this->latestUpdate?->created_at;
        $maxDays    = $this->stage->maxDaysInStage();

        // CRITICAL
        if ($this->expected_harvest_date && $this->expected_harvest_date->lt($now))
            return FieldStatus::Critical;

        if ($this->stage === FieldStage::Ready) {
            $daysSince = $lastUpdate ? $lastUpdate->diffInDays($now)
                : ($this->planting_date ? $this->planting_date->diffInDays($now) : 999);
            if ($daysSince >= 14) return FieldStatus::Critical;
        }

        if (!$this->assigned_agent_id && $this->stage->order() > FieldStage::Planted->order())
            return FieldStatus::Critical;

        if ($maxDays !== null && $this->getStageDays() >= ($maxDays * 2))
            return FieldStatus::Critical;

        // AT RISK
        if (!$this->assigned_agent_id) return FieldStatus::AtRisk;

        if ($maxDays !== null && $this->getStageDays() > $maxDays)
            return FieldStatus::AtRisk;

        if ($this->expected_harvest_date) {
            $daysToHarvest = $now->diffInDays($this->expected_harvest_date, false);
            if ($daysToHarvest <= 7 && $daysToHarvest >= 0
                && !in_array($this->stage, [FieldStage::Ready, FieldStage::Harvested]))
                return FieldStatus::AtRisk;
        }

        $activeStages = [FieldStage::Growing, FieldStage::Flowering, FieldStage::Maturing];
        if (in_array($this->stage, $activeStages)) {
            if (!$lastUpdate || $lastUpdate->diffInDays($now) > 14)
                return FieldStatus::AtRisk;
        }

        if ($this->stage === FieldStage::Ready) {
            $daysSince = $lastUpdate ? $lastUpdate->diffInDays($now) : 99;
            if ($daysSince >= 7) return FieldStatus::AtRisk;
        }

        return FieldStatus::Active;
    }

    public function getStatusReasonAttribute(): string
    {
        if ($this->is_abandoned)                    return 'Field has been marked as abandoned.';
        if ($this->stage === FieldStage::Harvested) return 'Crop has been successfully harvested.';

        $status     = $this->status;
        $now        = now();
        $lastUpdate = $this->latestUpdate?->created_at;
        $maxDays    = $this->stage->maxDaysInStage();

        if ($status === FieldStatus::Critical) {
            if ($this->expected_harvest_date?->lt($now))
                return 'Expected harvest date has passed without harvest.';
            if ($this->stage === FieldStage::Ready && $lastUpdate && $lastUpdate->diffInDays($now) >= 14)
                return 'Crop has been ready for 14+ days — harvest window may be missed.';
            if (!$this->assigned_agent_id && $this->stage->order() > FieldStage::Planted->order())
                return 'No agent assigned to an actively growing crop.';
            if ($maxDays && $this->getStageDays() >= $maxDays * 2)
                return "Stuck in '{$this->stage->label()}' for " . $this->getStageDays() . ' days — double the expected time.';
        }

        if ($status === FieldStatus::AtRisk) {
            if (!$this->assigned_agent_id) return 'No field agent assigned.';
            if ($maxDays && $this->getStageDays() > $maxDays)
                return "In '{$this->stage->label()}' for " . $this->getStageDays() . " days (expected max: {$maxDays}).";
            if ($this->expected_harvest_date) {
                $d = $now->diffInDays($this->expected_harvest_date, false);
                if ($d <= 7 && $d >= 0) return "Harvest expected in {$d} days but not yet ready.";
            }
            if ($lastUpdate && $lastUpdate->diffInDays($now) > 14) return 'No field update in over 14 days.';
            if ($this->stage === FieldStage::Ready) return 'Crop is ready — harvest window is closing.';
        }

        return 'Field is progressing normally.';
    }

    public function getStatusLabelAttribute(): string      { return $this->status->label(); }
    public function getDaysActiveSincePlantingAttribute(): int
    {
        return $this->planting_date ? (int) $this->planting_date->diffInDays(now()) : 0;
    }
    public function getDaysToHarvestAttribute(): ?int
    {
        if (!$this->expected_harvest_date) return null;
        return (int) now()->diffInDays($this->expected_harvest_date, false);
    }

    public function getStageDays(): int
    {
        if ($this->relationLoaded('updates')) {
            $first = $this->updates
                ->where('stage', $this->stage)
                ->sortBy('created_at')
                ->first();
        } else {
            $first = $this->updates()
                ->where('stage', $this->stage->value)
                ->oldest()
                ->first();
        }
        if ($first) return (int) $first->created_at->diffInDays(now());
        return $this->planting_date ? (int) $this->planting_date->diffInDays(now()) : 0;
    }
}
