<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Grupos de mensajería (creadosl por docentes para sus cursos)
        Schema::create('mensajeria_grupos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('insti_id')->nullable();
            $table->string('nombre', 150);
            $table->unsignedBigInteger('docente_id')->nullable(); // FK users.id
            $table->timestamps();
        });

        // Miembros de cada grupo
        Schema::create('mensajeria_grupo_miembros', function (Blueprint $table) {
            $table->unsignedBigInteger('grupo_id');
            $table->unsignedBigInteger('user_id');
            $table->primary(['grupo_id', 'user_id']);
        });

        // Mensajes enviados (individual o a grupo)
        Schema::create('mensajes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('insti_id')->nullable();
            $table->unsignedBigInteger('remitente_id');           // FK users.id
            $table->unsignedBigInteger('destinatario_id')->nullable(); // FK users.id (mensaje individual)
            $table->unsignedBigInteger('grupo_id')->nullable();   // FK mensajeria_grupos.id
            $table->string('asunto', 255);
            $table->text('cuerpo');
            $table->boolean('leido')->default(false);
            $table->timestamps();
        });

        // Respuestas/hilo de conversación
        Schema::create('mensajes_respuestas', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mensaje_id');             // FK mensajes.id
            $table->unsignedBigInteger('user_id');                // FK users.id
            $table->text('respuesta');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mensajes_respuestas');
        Schema::dropIfExists('mensajes');
        Schema::dropIfExists('mensajeria_grupo_miembros');
        Schema::dropIfExists('mensajeria_grupos');
    }
};
