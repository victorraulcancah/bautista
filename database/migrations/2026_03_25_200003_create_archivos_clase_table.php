<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('archivos_clase', function (Blueprint $table) {
            $table->id('archivo_id');
            $table->foreignId('clase_id')->constrained('clases', 'clase_id')->cascadeOnDelete();
            $table->string('nombre', 255);       // nombre original del archivo
            $table->string('path', 500);         // ruta en storage
            $table->string('tipo', 100)->nullable(); // mime type
            $table->unsignedBigInteger('tamanio')->nullable(); // bytes
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('archivos_clase');
    }
};
