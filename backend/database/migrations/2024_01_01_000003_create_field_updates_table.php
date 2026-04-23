<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('field_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('field_id')->constrained('fields')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('stage', [
                'planted','germinated','growing','flowering','maturing','ready','harvested'
            ]);
            $table->text('notes')->nullable();
            $table->unsignedTinyInteger('health_score')->nullable()->comment('1-10 crop health rating');
            $table->timestamps();

            $table->index(['field_id', 'created_at']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('field_updates');
    }
};
