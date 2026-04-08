<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mis_medios', function (Blueprint $table) {
            $table->unsignedBigInteger('carpeta_id')->nullable()->after('user_id');
            $table->boolean('es_carpeta')->default(false)->after('carpeta_id');
            
            // Si es carpeta, estos campos pueden ser null
            $table->string('tipo')->nullable()->change();
            $table->string('ruta')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('mis_medios', function (Blueprint $table) {
            $table->dropColumn(['carpeta_id', 'es_carpeta']);
        });
    }
};
