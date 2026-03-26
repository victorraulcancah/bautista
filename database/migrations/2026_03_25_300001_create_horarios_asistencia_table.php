<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('horarios_asistencia', function (Blueprint $table) {
            $table->id('horario_id');
            $table->foreignId('insti_id')->constrained('institucion_educativa', 'insti_id')->cascadeOnDelete();
            $table->foreignId('nivel_id')->nullable()->constrained('niveles_educativos', 'nivel_id')->nullOnDelete();
            $table->char('tipo_usuario', 1)->comment('E=estudiante, D=docente');
            $table->char('turno', 1)->comment('M=mañana, T=tarde');
            $table->time('hora_ingreso');
            $table->time('hora_salida');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horarios_asistencia');
    }
};
