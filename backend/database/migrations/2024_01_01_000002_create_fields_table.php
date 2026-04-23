<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fields', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('crop_type');
            $table->date('planting_date');
            $table->date('expected_harvest_date')->nullable();
            $table->enum('stage', [
                'planted','germinated','growing','flowering','maturing','ready','harvested'
            ])->default('planted');
            $table->foreignId('assigned_agent_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();
            $table->string('location')->nullable();
            $table->decimal('area_hectares', 8, 2)->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_abandoned')->default(false);
            $table->timestamps();

            $table->index('assigned_agent_id');
            $table->index('stage');
            $table->index('is_abandoned');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fields');
    }
};
