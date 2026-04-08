<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mensajes_privados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('remitente_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('destinatario_id')->constrained('users')->onDelete('cascade');
            $table->string('asunto');
            $table->text('cuerpo');
            
            // Estados tipo Gmail
            $table->boolean('leido_remitente')->default(true); // El remitente siempre lo ve como leído
            $table->boolean('leido_destinatario')->default(false);
            $table->boolean('archivado_remitente')->default(false);
            $table->boolean('archivado_destinatario')->default(false);
            $table->boolean('eliminado_remitente')->default(false);
            $table->boolean('eliminado_destinatario')->default(false);
            $table->boolean('destacado_remitente')->default(false);
            $table->boolean('destacado_destinatario')->default(false);
            
            // Etiquetas/Categorías
            $table->string('categoria')->nullable(); // 'principal', 'social', 'promociones', etc.
            
            // Metadata
            $table->timestamp('leido_en')->nullable();
            $table->timestamps();
            $table->softDeletes(); // Para papelera
            
            // Índices para mejorar rendimiento
            $table->index(['remitente_id', 'eliminado_remitente']);
            $table->index(['destinatario_id', 'eliminado_destinatario']);
            $table->index(['destinatario_id', 'leido_destinatario']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mensajes_privados');
    }
};
