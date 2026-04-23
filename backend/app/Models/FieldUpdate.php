<?php

namespace App\Models;

use App\Enums\FieldStage;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class FieldUpdate extends Model
{
    use HasFactory;

    protected $fillable = ['field_id', 'user_id', 'stage', 'notes', 'health_score'];

    protected function casts(): array
    {
        return [
            'stage'        => FieldStage::class,
            'health_score' => 'integer',
        ];
    }

    public function field(): BelongsTo { return $this->belongsTo(Field::class); }
    public function user(): BelongsTo  { return $this->belongsTo(User::class); }
}
