<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('padre_apoderado', function (Blueprint $table) {
            $table->id('id_contacto');
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('insti_id')->nullable();
            $table->foreign('insti_id')->references('insti_id')->on('institucion_educativa')->nullOnDelete();
            $table->string('nombres', 200)->nullable();
            $table->string('apellidos', 200)->nullable();
            $table->string('direccion', 200)->nullable();
            $table->string('departamento_id', 3)->nullable();
            $table->string('provincia_id', 3)->nullable();
            $table->string('distrito_id', 3)->nullable();
            $table->string('telefono_1', 20)->nullable();
            $table->string('telefono_2', 20)->nullable();
            $table->unsignedTinyInteger('tipo_doc')->nullable();
            $table->string('numero_doc', 20)->nullable();
            $table->char('genero', 1)->nullable()->comment('M=masculino, F=femenino');
            $table->date('fecha_nacimiento')->nullable();
            $table->string('nacionalidad', 50)->nullable();
            $table->string('estado_civil', 50)->nullable();
            $table->char('es_pagador', 5)->nullable()->comment('si es encargado del pago');
            $table->string('email_contacto', 200)->nullable();
            $table->char('estado', 1)->default('1')->comment('1=activo, 0=inactivo');
            $table->string('foto_perfil', 200)->nullable();
            $table->string('facebook', 255)->nullable();
            $table->string('instagram', 255)->nullable();
            $table->string('tiktok', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('padre_apoderado');
    }
};
