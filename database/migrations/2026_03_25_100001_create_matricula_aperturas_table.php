<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matricula_aperturas', function (Blueprint $table) {
            $table->id('apertura_id');
            $table->foreignId('insti_id')->constrained('institucion_educativa', 'insti_id')->cascadeOnDelete();
            $table->string('nombre', 100);           // Ej: "Matrícula 2026 - I"
            $table->year('anio');
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->char('estado', 1)->default('1'); // 1=activo, 0=cerrado
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matricula_aperturas');
    }
};
