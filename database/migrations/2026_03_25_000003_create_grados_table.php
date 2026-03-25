<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grados', function (Blueprint $table) {
            $table->id('grado_id');
            $table->unsignedBigInteger('nivel_id')->nullable();
            $table->string('nombre_grado', 200);
            $table->string('abreviatura', 100)->nullable();
            $table->timestamps();

            $table->foreign('nivel_id')->references('nivel_id')->on('niveles_educativos')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grados');
    }
};
