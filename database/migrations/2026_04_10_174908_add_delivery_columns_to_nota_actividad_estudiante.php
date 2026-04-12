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
        Schema::table('nota_actividad_estudiante', function (Blueprint $table) {
            $table->string('archivo_entrega')->nullable()->after('observacion');
            $table->timestamp('fecha_entrega')->nullable()->after('archivo_entrega');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('nota_actividad_estudiante', function (Blueprint $table) {
            $table->dropColumn(['archivo_entrega', 'fecha_entrega']);
        });
    }
};
