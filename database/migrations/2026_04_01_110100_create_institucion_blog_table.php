<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('institucion_blog', function (Blueprint $table) {
            $table->id('blo_id');
            $table->longText('blo_titulo')->nullable();
            $table->longText('blo_contenido')->nullable();
            $table->longText('blo_imagen')->nullable();
            $table->date('blo_fecha')->nullable();
            $table->unsignedBigInteger('insti_id')->nullable();
            $table->unsignedBigInteger('usuario_id')->nullable();
            $table->tinyInteger('blo_estatus')->nullable()->comment('1=activo, 0=inactivo');
            $table->timestamps();

            $table->foreign('insti_id')->references('insti_id')->on('institucion_educativa')->cascadeOnDelete();
            $table->foreign('usuario_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('institucion_blog');
    }
};
