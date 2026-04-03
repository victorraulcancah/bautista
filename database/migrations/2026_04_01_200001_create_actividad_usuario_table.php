<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('actividad_usuario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->string('accion', 20);        // crear | actualizar | eliminar | ver
            $table->string('entidad', 60);       // nombre del modelo: Estudiante, Pago, etc.
            $table->unsignedBigInteger('entidad_id')->nullable();
            $table->string('descripcion', 255);  // texto legible del evento
            $table->string('ip', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('actividad_usuario');
    }
};
