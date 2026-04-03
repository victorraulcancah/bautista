<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pago_notifica', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pag_id')
                ->constrained('pagos', 'pag_id')
                ->cascadeOnDelete();
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->string('archivo');                // ruta relativa en storage
            $table->enum('estado', ['pendiente', 'validado', 'rechazado'])->default('pendiente');
            $table->text('comentario')->nullable();   // observación del admin al validar
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pago_notifica');
    }
};
