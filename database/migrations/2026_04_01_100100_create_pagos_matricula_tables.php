<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pagos_matricula', function (Blueprint $table) {
            $table->id('pago_id');
            $table->unsignedBigInteger('id_matricula')->nullable();
            $table->double('monto', 10, 2)->nullable();
            $table->double('mora_total', 10, 2)->nullable()->comment('monto extra por pago fuera de tiempo');
            $table->double('decuento', 10, 2)->nullable();
            $table->double('porcentaje_mora', 8, 2)->nullable();
            $table->date('fecha')->nullable();
            $table->timestamps();

            $table->foreign('id_matricula')->references('matricula_id')->on('matriculas')->cascadeOnDelete();
        });

        Schema::create('fechas_pagos', function (Blueprint $table) {
            $table->id('fechapago_id');
            $table->unsignedBigInteger('id_pago')->nullable();
            $table->date('fecha_final')->nullable()->comment('ultimo dia de pago');
            $table->double('monto', 10, 2)->nullable();
            $table->integer('id_moneda')->nullable();
            $table->char('estado', 1)->nullable();
            $table->timestamps();

            $table->foreign('id_pago')->references('pago_id')->on('pagos_matricula')->cascadeOnDelete();
        });

        Schema::create('pagos_extras', function (Blueprint $table) {
            $table->id('pagoextra_id');
            $table->unsignedBigInteger('id_fech_pago')->nullable();
            $table->double('monto', 10, 2)->nullable();
            $table->date('fecha')->nullable();
            $table->timestamps();

            $table->foreign('id_fech_pago')->references('fechapago_id')->on('fechas_pagos')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagos_extras');
        Schema::dropIfExists('fechas_pagos');
        Schema::dropIfExists('pagos_matricula');
    }
};
