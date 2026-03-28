<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Individual grades per activity
        Schema::create('nota_actividad_estudiante', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('estu_id');
            $table->unsignedBigInteger('actividad_id');
            $table->string('nota', 5)->nullable();
            $table->text('observacion')->nullable();
            $table->timestamp('fecha_calificacion')->useCurrent();
            $table->timestamps();

            $table->foreign('estu_id')->references('estu_id')->on('estudiantes')->cascadeOnDelete();
            $table->foreign('actividad_id')->references('actividad_id')->on('actividad_curso')->cascadeOnDelete();
            $table->unique(['estu_id', 'actividad_id']);
        });

        // 2. Unit averages
        Schema::create('nota_unidad', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('estu_id');
            $table->unsignedBigInteger('unidad_id');
            $table->decimal('nota_final', 5, 2)->nullable();
            $table->char('estado', 1)->default('1');
            $table->timestamps();

            $table->foreign('estu_id')->references('estu_id')->on('estudiantes')->cascadeOnDelete();
            $table->foreign('unidad_id')->references('unidad_id')->on('unidades')->cascadeOnDelete();
            $table->unique(['estu_id', 'unidad_id']);
        });

        // 3. Final course results
        Schema::create('notas_estudiante', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('estu_id');
            $table->unsignedBigInteger('curso_id');
            $table->year('año_lectivo');
            $table->decimal('promedio_final', 5, 2)->nullable();
            $table->timestamps();

            $table->foreign('estu_id')->references('estu_id')->on('estudiantes')->cascadeOnDelete();
            $table->foreign('curso_id')->references('curso_id')->on('cursos', 'curso_id')->cascadeOnDelete();
            $table->unique(['estu_id', 'curso_id', 'año_lectivo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notas_estudiante');
        Schema::dropIfExists('nota_unidad');
        Schema::dropIfExists('nota_actividad_estudiante');
    }
};
