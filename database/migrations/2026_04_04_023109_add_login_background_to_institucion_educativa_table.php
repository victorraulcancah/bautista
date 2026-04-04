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
        Schema::table('institucion_educativa', function (Blueprint $table) {
            $table->string('insti_fondo_login')->nullable()->after('insti_logo');
        });
    }

    public function down(): void
    {
        Schema::table('institucion_educativa', function (Blueprint $table) {
            $table->dropColumn('insti_fondo_login');
        });
    }
};
