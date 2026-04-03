<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('docente_cursos', function (Blueprint $table) {
            $table->id('docen_curso_id');
            $table->unsignedBigInteger('docente_id');
            $table->unsignedBigInteger('apertura_id')->nullable();
            $table->unsignedBigInteger('curso_id')->nullable();
            $table->unsignedBigInteger('nivel_id')->nullable();
            $table->unsignedBigInteger('grado_id')->nullable();
            $table->unsignedBigInteger('seccion_id')->nullable();
            $table->tinyInteger('estado')->default(1);
            $table->timestamps();

            $table->foreign('docente_id')->references('docente_id')->on('docentes')->cascadeOnDelete();
            $table->foreign('apertura_id')->references('apertura_id')->on('matricula_aperturas')->nullOnDelete();
            $table->foreign('curso_id')->references('curso_id')->on('cursos')->nullOnDelete();
            $table->foreign('nivel_id')->references('nivel_id')->on('niveles_educativos')->nullOnDelete();
            $table->foreign('grado_id')->references('grado_id')->on('grados')->nullOnDelete();
            $table->foreign('seccion_id')->references('seccion_id')->on('secciones')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('docente_cursos');
    }
};
