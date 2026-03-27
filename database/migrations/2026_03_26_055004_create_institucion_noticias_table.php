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
        Schema::create('institucion_noticias', function (Blueprint $table) {
            $table->id('not_id');
            $table->unsignedBigInteger('insti_id')->nullable();
            $table->string('not_titulo', 200);
            $table->text('not_mensaje')->nullable();
            $table->string('not_imagen', 200)->nullable();
            $table->date('not_fecha')->nullable();
            $table->tinyInteger('not_estatus')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('institucion_noticias');
    }
};
