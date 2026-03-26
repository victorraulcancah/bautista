<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asistencias', function (Blueprint $table) {
            $table->id('asistencia_id');
            $table->foreignId('insti_id')->constrained('institucion_educativa', 'insti_id')->cascadeOnDelete();
            $table->unsignedBigInteger('id_persona');  // estu_id o docente_id
            $table->char('tipo', 1)->comment('E=estudiante, D=docente');
            $table->date('fecha');
            $table->time('hora_entrada')->nullable();
            $table->time('hora_salida')->nullable();
            $table->char('turno', 1)->nullable()->comment('M=mañana, T=tarde');
            $table->char('estado', 1)->default('1')->comment('1=asistió, 0=faltó, T=tardanza');
            $table->string('observacion', 300)->nullable();
            $table->timestamps();

            $table->unique(['id_persona', 'tipo', 'fecha', 'turno']);
            $table->index(['insti_id', 'tipo', 'fecha']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asistencias');
    }
};
