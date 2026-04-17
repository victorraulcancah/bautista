<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('horario_clases', function (Blueprint $table) {
            $table->foreignId('aula_id')
                ->nullable()
                ->after('aula')
                ->constrained('aulas', 'aula_id')
                ->nullOnDelete();

            $table->index(['aula_id', 'dia_semana', 'anio_escolar']);
        });
    }

    public function down(): void
    {
        Schema::table('horario_clases', function (Blueprint $table) {
            $table->dropForeign(['aula_id']);
            $table->dropIndex(['aula_id', 'dia_semana', 'anio_escolar']);
            $table->dropColumn('aula_id');
        });
    }
};
