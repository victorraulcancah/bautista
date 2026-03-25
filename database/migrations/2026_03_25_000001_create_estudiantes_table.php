<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estudiantes', function (Blueprint $table) {
            $table->id('estu_id');
            $table->unsignedBigInteger('insti_id')->nullable();
            $table->unsignedBigInteger('perfil_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();        // FK a users (auth)

            $table->char('estado', 1)->default('1')->comment('1=activo, 0=inactivo, 5=bloqueado');
            $table->string('foto', 255)->nullable();
            $table->string('colegio', 255)->nullable();
            $table->string('neurodivergencia', 255)->nullable();
            $table->string('terapia_ocupacional', 255)->nullable();

            // Medidas físicas
            $table->integer('edad')->nullable();
            $table->string('talla', 50)->nullable();
            $table->decimal('peso', 14, 2)->nullable();

            // Seguro
            $table->string('seguro', 255)->nullable();
            $table->string('privado', 255)->nullable();

            // Redes sociales
            $table->string('redes', 10)->nullable();
            $table->string('facebook', 255)->nullable();
            $table->string('instagram', 255)->nullable();
            $table->string('tiktok', 255)->nullable();

            // Fechas académicas
            $table->date('fecha_ingreso')->nullable();
            $table->date('fecha_promovido')->nullable();

            // Finanzas
            $table->decimal('mensualidad', 14, 2)->nullable();

            $table->timestamps();

            $table->foreign('insti_id')->references('insti_id')->on('institucion_educativa')->nullOnDelete();
            $table->foreign('perfil_id')->references('perfil_id')->on('perfiles')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estudiantes');
    }
};
