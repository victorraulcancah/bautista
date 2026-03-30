<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seccion_horarios', function (Blueprint $table) {
            $table->id('horario_archivo_id');
            $table->foreignId('seccion_id')->constrained('secciones', 'seccion_id')->cascadeOnDelete();
            $table->string('nombre', 255);
            $table->string('path', 500);
            $table->string('tipo', 100)->nullable();
            $table->unsignedBigInteger('tamanio')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('seccion_horarios');
    }
};
