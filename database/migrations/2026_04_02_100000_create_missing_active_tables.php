<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. institucion_pagosm (Catálogo de conceptos)
        if (!Schema::hasTable('institucion_pagosm')) {
            Schema::create('institucion_pagosm', function (Blueprint $table) {
                $table->id('pag_id');
                $table->unsignedBigInteger('insti_id')->nullable();
                $table->string('pag_descripcion', 600)->nullable();
                $table->decimal('pag_monto', 14, 2)->nullable();
                $table->date('pag_fecha')->nullable();
                $table->integer('pag_estatus')->nullable();
                $table->timestamps();

                $table->foreign('insti_id')->references('insti_id')->on('institucion_educativa')->nullOnDelete();
            });
        }

        // 2. metodo_pago
        if (!Schema::hasTable('metodo_pago')) {
            Schema::create('metodo_pago', function (Blueprint $table) {
                $table->id('id_metodo_pago');
                $table->string('nombre', 100)->nullable();
                $table->char('estado', 1)->default('1');
                $table->timestamps();
            });
        }

        // 3. asistencia (Legacy - General/Biométrico)
        if (!Schema::hasTable('asistencia')) {
            Schema::create('asistencia', function (Blueprint $table) {
                $table->id('id_asistencia');
                $table->unsignedBigInteger('id_estudiante')->nullable();
                $table->smallInteger('tipo')->nullable();
                $table->dateTime('fecha')->nullable();
                $table->smallInteger('estado')->default(1);
                $table->timestamps();

                $table->foreign('id_estudiante')->references('estu_id')->on('estudiantes')->nullOnDelete();
            });
        }

        // 4. recuperacion_usuario
        if (!Schema::hasTable('recuperacion_usuario')) {
            Schema::create('recuperacion_usuario', function (Blueprint $table) {
                $table->id('id_recuperacion');
                $table->unsignedBigInteger('id_usuario')->nullable();
                $table->string('token', 100)->nullable();
                $table->timestamps();

                $table->foreign('id_usuario')->references('id')->on('users')->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('recuperacion_usuario');
        Schema::dropIfExists('asistencia');
        Schema::dropIfExists('metodo_pago');
        Schema::dropIfExists('institucion_pagosm');
    }
};
