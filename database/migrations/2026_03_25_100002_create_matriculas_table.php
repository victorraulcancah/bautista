<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matriculas', function (Blueprint $table) {
            $table->id('matricula_id');
            $table->foreignId('apertura_id')->constrained('matricula_aperturas', 'apertura_id')->cascadeOnDelete();
            $table->foreignId('estudiante_id')->constrained('estudiantes', 'estu_id')->cascadeOnDelete();
            $table->foreignId('seccion_id')->nullable()->constrained('secciones', 'seccion_id')->nullOnDelete();
            $table->year('anio');
            $table->char('estado', 1)->default('1'); // 1=activo, 0=anulado
            $table->timestamps();

            $table->unique(['apertura_id', 'estudiante_id']); // un estudiante por apertura
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matriculas');
    }
};
