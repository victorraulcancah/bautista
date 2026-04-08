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
        Schema::create('mensajes_privados_respuestas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mensaje_privado_id')->constrained('mensajes_privados')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('respuesta');
            $table->timestamps();
            
            // Índice para mejorar rendimiento
            $table->index('mensaje_privado_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mensajes_privados_respuestas');
    }
};
