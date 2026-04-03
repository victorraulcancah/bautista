<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mis_medios', function (Blueprint $table) {
            $table->id('id_medio');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('nombre', 200)->nullable();
            $table->string('tipo', 10)->nullable();
            $table->string('ruta', 200)->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mis_medios');
    }
};
