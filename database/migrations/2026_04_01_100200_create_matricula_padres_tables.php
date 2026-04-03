<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matricula_padres', function (Blueprint $table) {
            $table->id('matri_padre_id');
            $table->char('termino', 1)->default('0');
            $table->char('datos_padres', 1)->default('0');
            $table->char('datos_alumnos', 1)->default('0');
            $table->char('estado_verifica', 1)->default('0');
            $table->char('confirmado', 1)->default('0');
            $table->string('archivo', 200)->nullable();
            $table->string('periodo', 5)->nullable();
            $table->date('fecha_registro')->nullable();
            $table->timestamps();
        });

        Schema::create('grupo_matricula_padres', function (Blueprint $table) {
            $table->id('grupo_id');
            $table->unsignedBigInteger('id_matricula')->nullable();
            $table->unsignedBigInteger('id_padre_apoderado')->nullable();
            $table->timestamps();

            $table->foreign('id_matricula')->references('matri_padre_id')->on('matricula_padres')->cascadeOnDelete();
            $table->foreign('id_padre_apoderado')->references('id_contacto')->on('padre_apoderado')->cascadeOnDelete();
        });

        Schema::create('hijos_matriculados', function (Blueprint $table) {
            $table->id('hijos_matri_id');
            $table->unsignedBigInteger('id_matricula_padres')->nullable();
            $table->unsignedBigInteger('id_alumno')->nullable();
            $table->unsignedBigInteger('nivel_academico')->nullable();
            $table->unsignedBigInteger('grado_academico')->nullable();
            $table->unsignedBigInteger('seccion_academico')->nullable();
            $table->timestamps();

            $table->foreign('id_matricula_padres')->references('matri_padre_id')->on('matricula_padres')->cascadeOnDelete();
            $table->foreign('id_alumno')->references('estu_id')->on('estudiantes')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hijos_matriculados');
        Schema::dropIfExists('grupo_matricula_padres');
        Schema::dropIfExists('matricula_padres');
    }
};
