<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grados_cursos', function (Blueprint $table) {
            $table->id('grac_id');
            $table->unsignedBigInteger('id_grado')->nullable();
            $table->unsignedBigInteger('id_curso')->nullable();
            $table->tinyInteger('grac_estado')->nullable()->comment('1=activo, 0=eliminado');
            $table->timestamps();

            $table->foreign('id_grado')->references('grado_id')->on('grados')->cascadeOnDelete();
            $table->foreign('id_curso')->references('curso_id')->on('cursos')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grados_cursos');
    }
};
