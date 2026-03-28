<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tracks an attempt to solve an exam
        Schema::create('examen_iniciado', function (Blueprint $table) {
            $table->id('intento_id');
            $table->unsignedBigInteger('estu_id');
            $table->unsignedBigInteger('actividad_id');
            $table->timestamp('fecha_inicio')->useCurrent();
            $table->timestamp('fecha_limite')->nullable();
            $table->timestamp('fecha_fin')->nullable();
            $table->char('estado', 1)->default('1')->comment('1=activo, 0=finalizado');
            $table->decimal('puntaje_total', 5, 2)->default(0);
            $table->timestamps();

            $table->foreign('estu_id')->references('estu_id')->on('estudiantes')->cascadeOnDelete();
            $table->foreign('actividad_id')->references('actividad_id')->on('actividad_curso')->cascadeOnDelete();
        });

        // 2. Student's response per question
        Schema::create('pregunta_resp', function (Blueprint $table) {
            $table->id('resp_id');
            $table->unsignedBigInteger('intento_id');
            $table->unsignedBigInteger('pregunta_id');
            $table->unsignedBigInteger('alternativa_id')->nullable();
            $table->text('respuesta_texto')->nullable();
            $table->boolean('es_correcta')->default(false);
            $table->decimal('puntaje', 5, 2)->default(0);
            $table->timestamps();

            $table->foreign('intento_id')->references('intento_id')->on('examen_iniciado')->cascadeOnDelete();
            $table->foreign('pregunta_id')->references('pregunta_id')->on('pregunta_cuestionario')->cascadeOnDelete();
            $table->foreign('alternativa_id')->references('alternativa_id')->on('alternativas_pregunta')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pregunta_resp');
        Schema::dropIfExists('examen_iniciado');
    }
};
