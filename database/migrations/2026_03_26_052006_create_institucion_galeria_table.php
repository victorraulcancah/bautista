<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('institucion_galeria', function (Blueprint $table) {
            $table->id('gal_id');
            $table->unsignedBigInteger('insti_id')->nullable();
            $table->foreign('insti_id')->references('insti_id')->on('institucion_educativa')->cascadeOnDelete();
            $table->string('gal_nombre', 150)->nullable()->comment('nombre del archivo imagen');
            $table->integer('gal_posicion')->default(0)->comment('orden de visualización');
            $table->tinyInteger('gal_estatus')->default(1)->comment('1=activo, 0=inactivo');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('institucion_galeria');
    }
};
