<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Almacena las imágenes asociadas a cada actividad de rompecabezas
        Schema::create('imagen_rompecabeza', function (Blueprint $table) {
            $table->id('rompe_id');
            $table->unsignedBigInteger('actividad_id');
            $table->string('imagen', 500);
            $table->timestamps();

            $table->foreign('actividad_id')->references('actividad_id')->on('actividad_curso')->cascadeOnDelete();
        });

        // Almacena el progreso de cada estudiante en una actividad de rompecabezas
        Schema::create('alumno_rompecabeza', function (Blueprint $table) {
            $table->id('alum_rompe_id');
            $table->unsignedBigInteger('estu_id');
            $table->unsignedBigInteger('actividad_id');
            $table->integer('intentos')->default(0);
            $table->string('tiempo', 20)->nullable(); // Ej. 00:02:45
            $table->char('ayuda', 1)->default('0'); // 0=No, 1=Sí
            $table->timestamps();

            $table->foreign('estu_id')->references('estu_id')->on('estudiantes')->cascadeOnDelete();
            $table->foreign('actividad_id')->references('actividad_id')->on('actividad_curso')->cascadeOnDelete();
            
            $table->unique(['estu_id', 'actividad_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alumno_rompecabeza');
        Schema::dropIfExists('imagen_rompecabeza');
    }
};
