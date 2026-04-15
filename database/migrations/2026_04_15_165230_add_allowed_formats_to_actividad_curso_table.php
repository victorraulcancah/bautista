<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('actividad_curso', function (Blueprint $table) {
            $table->string('allowed_formats', 255)->nullable()->after('puntos_maximos');
        });
    }

    public function down(): void
    {
        Schema::table('actividad_curso', function (Blueprint $table) {
            $table->dropColumn('allowed_formats');
        });
    }
};
