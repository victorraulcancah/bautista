<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Archivos adjuntos de actividades (docente o estudiante)
        Schema::create('archivos_actividad', function (Blueprint $table) {
            $table->id('archiv_actividad_id');
            $table->unsignedBigInteger('id_actividad')->nullable();
            $table->char('origen', 1)->nullable()->comment('d=docente, e=estudiante');
            $table->string('archivo', 200)->nullable();
            $table->string('nombre_archivo', 200)->nullable();
            $table->string('tipo_archivo', 50)->nullable();
            $table->unsignedBigInteger('estudiante')->nullable();
            $table->timestamps();

            $table->foreign('id_actividad')->references('actividad_id')->on('actividad_curso')->cascadeOnDelete();
            $table->foreign('estudiante')->references('estu_id')->on('estudiantes')->cascadeOnDelete();
        });

        // Nota base por actividad (registro de calificación)
        Schema::create('nota_actividad', function (Blueprint $table) {
            $table->id('nota_activida_id');
            $table->unsignedBigInteger('id_actividad')->nullable();
            $table->unsignedBigInteger('id_estudiante')->nullable();
            $table->string('calificacion', 5)->nullable();
            $table->dateTime('fecha_calificada')->nullable();
            $table->char('estado', 1)->nullable();
            $table->timestamps();

            $table->foreign('id_actividad')->references('actividad_id')->on('actividad_curso')->cascadeOnDelete();
            $table->foreign('id_estudiante')->references('estu_id')->on('estudiantes')->cascadeOnDelete();
        });

        // Contenido escrito de preguntas (material de lección)
        Schema::create('contenido_escrito', function (Blueprint $table) {
            $table->id('contenido_id');
            $table->unsignedBigInteger('id_pregunta')->nullable();
            $table->text('respuesta')->nullable();
            $table->timestamps();

            $table->foreign('id_pregunta')->references('pregunta_id')->on('pregunta_cuestionario')->cascadeOnDelete();
        });

        // Respuestas escritas de estudiantes en exámenes
        Schema::create('respuesta_escrita', function (Blueprint $table) {
            $table->id('res_id');
            $table->unsignedBigInteger('id_exam_ini')->nullable();
            $table->unsignedBigInteger('id_pregunta')->nullable();
            $table->longText('respuesta')->nullable();
            $table->timestamps();

            $table->foreign('id_pregunta')->references('pregunta_id')->on('pregunta_cuestionario')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('respuesta_escrita');
        Schema::dropIfExists('contenido_escrito');
        Schema::dropIfExists('nota_actividad');
        Schema::dropIfExists('archivos_actividad');
    }
};
