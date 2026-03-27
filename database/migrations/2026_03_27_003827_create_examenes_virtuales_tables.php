<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // tipo_actividad lookup table
        Schema::create('tipo_actividad', function (Blueprint $table) {
            $table->id('tipo_id');
            $table->string('nombre', 100)->nullable();
            $table->timestamps();
        });

        // actividad_curso
        Schema::create('actividad_curso', function (Blueprint $table) {
            $table->id('actividad_id');
            $table->unsignedBigInteger('id_curso')->nullable();
            $table->unsignedBigInteger('id_clase_curso')->nullable();
            $table->unsignedBigInteger('id_tipo_activada')->nullable();
            $table->string('nombre_activid', 200)->nullable();
            $table->text('descripcion_corta')->nullable();
            $table->longText('descripcion_larga')->nullable();
            $table->dateTime('fecha_inicio')->nullable();
            $table->dateTime('fecha_cierre')->nullable();
            $table->char('nota_visible', 1)->nullable()->comment('1=visible, 0= no visible');
            $table->string('nota_actvidad', 5)->nullable();
            $table->char('respuesta_visible', 1)->nullable()->comment('solo examne: 1 = visible 0= no visible');
            $table->char('ocultar_actividad', 1)->nullable()->comment('1=visible, 0= no visible');
            $table->char('estado', 1)->nullable();
            $table->char('es_calificado', 1)->nullable()->comment('1= si, 0= no');
            $table->timestamps();
        });

        // tipo_respuesta_quiz
        Schema::create('tipo_respuesta_quiz', function (Blueprint $table) {
            $table->id('tipo_id');
            $table->string('nombre', 100)->nullable();
            $table->timestamps();
        });

        // cuestionario
        Schema::create('cuestionario', function (Blueprint $table) {
            $table->id('cuestionario_id');
            $table->unsignedBigInteger('id_actividad')->nullable();
            $table->double('duracion', 10, 2)->nullable();
            $table->char('nota_visible', 1)->default('0');
            $table->char('mostrar_respusta', 1)->default('0');
            $table->char('estado', 1)->nullable();
            $table->timestamps();
        });

        // pregunta_cuestionario
        Schema::create('pregunta_cuestionario', function (Blueprint $table) {
            $table->id('pregunta_id');
            $table->unsignedBigInteger('id_cuestionario')->nullable();
            $table->string('cabecera', 250)->nullable();
            $table->longText('cuerpo')->nullable();
            $table->unsignedBigInteger('tipo_respuesta')->nullable();
            $table->string('valor_nota', 5)->nullable();
            $table->timestamps();
        });

        // alternativas_pregunta
        Schema::create('alternativas_pregunta', function (Blueprint $table) {
            $table->id('alternativa_id');
            $table->unsignedBigInteger('id_pregunta')->nullable();
            $table->longText('contenido')->nullable();
            $table->char('estado_res', 1)->default('0')->comment('1= correcta, 0= incorrecta');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alternativas_pregunta');
        Schema::dropIfExists('pregunta_cuestionario');
        Schema::dropIfExists('cuestionario');
        Schema::dropIfExists('tipo_respuesta_quiz');
        Schema::dropIfExists('actividad_curso');
        Schema::dropIfExists('tipo_actividad');
    }
};
