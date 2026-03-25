<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cursos', function (Blueprint $table) {
            $table->id('curso_id');
            $table->unsignedBigInteger('id_insti')->nullable();
            $table->foreign('id_insti')->references('insti_id')->on('institucion_educativa')->cascadeOnDelete();
            $table->string('nombre', 100)->nullable();
            $table->longText('descripcion')->nullable();
            $table->string('logo', 200)->nullable();
            $table->unsignedBigInteger('nivel_academico_id')->nullable();
            $table->unsignedBigInteger('grado_academico')->nullable();
            $table->char('estado', 1)->default('1')->comment('1=activo, 0=inactivo');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cursos');
    }
};
