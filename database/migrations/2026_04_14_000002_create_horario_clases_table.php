<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('horario_clases', function (Blueprint $table) {
            $table->id('horario_clase_id');
            
            // Relaciones
            $table->foreignId('seccion_id')->constrained('secciones', 'seccion_id')->cascadeOnDelete();
            $table->foreignId('curso_id')->constrained('cursos', 'curso_id')->cascadeOnDelete();
            $table->foreignId('docente_id')->constrained('docentes', 'docente_id')->cascadeOnDelete();
            
            // Tiempo
            $table->tinyInteger('dia_semana')->unsigned()->comment('1=Lunes, 2=Martes, ..., 7=Domingo');
            $table->time('hora_inicio');
            $table->time('hora_fin');
            
            // Ubicación
            $table->string('aula', 50)->nullable();
            
            // Periodo académico
            $table->integer('anio_escolar');
            $table->char('periodo', 1)->default('A')->comment('A=Anual, 1=Bimestre1, etc.');
            
            // Estado
            $table->boolean('activo')->default(true);
            
            $table->timestamps();
            
            // Índices para optimizar consultas
            $table->index(['seccion_id', 'dia_semana', 'anio_escolar']);
            $table->index(['docente_id', 'dia_semana', 'anio_escolar']);
            $table->index(['anio_escolar', 'periodo', 'activo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('horario_clases');
    }
};
