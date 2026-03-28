<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asistencia_clases', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_clase_curso');
            $table->date('fecha');
            $table->char('estado', 1)->default('1')->comment('1=abierto, 0=cerrado');
            $table->timestamps();

            $table->foreign('id_clase_curso')->references('clase_id')->on('clases')->cascadeOnDelete();
        });

        Schema::create('asistencia_alumnos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_asistencia_clase');
            $table->unsignedBigInteger('id_estudiante');
            $table->char('estado', 1)->comment('P=presente, F=falta, J=justif, U=tardanza');
            $table->text('observacion')->nullable();
            $table->timestamps();

            $table->foreign('id_asistencia_clase')->references('id')->on('asistencia_clases')->cascadeOnDelete();
            $table->foreign('id_estudiante')->references('estu_id')->on('estudiantes')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asistencia_alumnos');
        Schema::dropIfExists('asistencia_clases');
    }
};
