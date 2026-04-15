<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('horario_bloques', function (Blueprint $table) {
            $table->id('bloque_id');
            $table->foreignId('insti_id')->constrained('institucion_educativa', 'insti_id')->cascadeOnDelete();
            
            $table->string('nombre', 100);
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->tinyInteger('orden')->unsigned();
            $table->boolean('es_recreo')->default(false);
            
            $table->timestamps();
            
            $table->index(['insti_id', 'orden']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horario_bloques');
    }
};
