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
        Schema::table('actividad_curso', function (Blueprint $table) {
            // Peso/porcentaje de la actividad en la nota final de la unidad (0-100)
            $table->decimal('peso_porcentaje', 5, 2)->default(0)->after('nota_actividad')
                ->comment('Peso de la actividad en % (ej: 40.00 = 40%)');
            
            // Puntos máximos de la actividad (para calcular la escala)
            $table->decimal('puntos_maximos', 8, 2)->default(20)->after('peso_porcentaje')
                ->comment('Puntos máximos de la actividad (ej: 10, 20, 100)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('actividad_curso', function (Blueprint $table) {
            $table->dropColumn(['peso_porcentaje', 'puntos_maximos']);
        });
    }
};
