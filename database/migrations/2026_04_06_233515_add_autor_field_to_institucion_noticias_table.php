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
        Schema::table('institucion_noticias', function (Blueprint $table) {
            $table->string('autor')->nullable()->after('not_titulo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('institucion_noticias', function (Blueprint $table) {
            $table->dropColumn('autor');
        });
    }
};
