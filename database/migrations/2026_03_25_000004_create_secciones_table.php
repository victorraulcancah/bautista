<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('secciones', function (Blueprint $table) {
            $table->id('seccion_id');
            $table->unsignedBigInteger('id_grado')->nullable();
            $table->string('nombre', 50);
            $table->string('abreviatura', 5)->nullable();
            $table->integer('cnt_alumnos')->default(0);
            $table->string('horario', 255)->nullable();
            $table->timestamps();

            $table->foreign('id_grado')->references('grado_id')->on('grados')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('secciones');
    }
};
