<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('docentes', function (Blueprint $table) {
            $table->id('docente_id');
            $table->unsignedBigInteger('id_insti')->nullable();
            $table->unsignedBigInteger('id_perfil')->nullable();
            $table->unsignedBigInteger('id_usuario')->nullable();
            $table->string('especialidad', 200)->nullable();
            $table->tinyInteger('planilla')->default(1)->comment('1=en planilla, 0=no');
            $table->char('estado', 1)->default('1')->comment('1=activo, 0=inactivo');
            $table->timestamps();

            $table->foreign('id_insti')->references('insti_id')->on('institucion_educativa')->nullOnDelete();
            $table->foreign('id_perfil')->references('perfil_id')->on('perfiles')->cascadeOnDelete();
            $table->foreign('id_usuario')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('docentes');
    }
};
