<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('perfiles', function (Blueprint $table) {
            $table->id('perfil_id');
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->char('genero', 1)->nullable()->comment('M=masculino, F=femenino');
            $table->string('primer_nombre', 200)->nullable();
            $table->string('segundo_nombre', 100)->nullable();
            $table->string('apellido_paterno', 100)->nullable();
            $table->string('apellido_materno', 100)->nullable();
            $table->unsignedTinyInteger('tipo_doc')->nullable()->comment('1=DNI, 2=CE, etc.');
            $table->string('doc_numero', 30)->nullable();
            $table->date('fecha_nacimiento')->nullable();
            $table->date('fecha_registro')->nullable();
            $table->string('direccion', 200)->nullable();
            $table->string('telefono', 50)->nullable();
            $table->string('foto_perfil', 200)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('perfiles');
    }
};
