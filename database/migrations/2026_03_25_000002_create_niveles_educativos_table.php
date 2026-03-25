<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('niveles_educativos', function (Blueprint $table) {
            $table->id('nivel_id');
            $table->unsignedBigInteger('insti_id')->nullable();
            $table->string('nombre_nivel', 50);
            $table->tinyInteger('nivel_estatus')->default(1)->comment('1=activo, 0=inactivo');
            $table->timestamps();

            $table->foreign('insti_id')->references('insti_id')->on('institucion_educativa')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('niveles_educativos');
    }
};
