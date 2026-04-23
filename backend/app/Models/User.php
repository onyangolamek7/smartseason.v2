<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role'];

    protected $hidden   = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'role'              => UserRole::class,
        ];
    }

    public function isAdmin(): bool      { return $this->role === UserRole::Admin; }
    public function isFieldAgent(): bool { return $this->role === UserRole::FieldAgent; }

    public function fields(): HasMany
    {
        return $this->hasMany(Field::class, 'assigned_agent_id');
    }

    public function fieldUpdates(): HasMany
    {
        return $this->hasMany(FieldUpdate::class);
    }
}
