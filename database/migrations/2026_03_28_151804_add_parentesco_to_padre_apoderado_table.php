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
        Schema::table('padre_apoderado', function (Blueprint $table) {
            $table->string('parentesco', 20)->nullable()->after('insti_id')
                ->comment('padre | madre | apoderado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('padre_apoderado', function (Blueprint $table) {
            $table->dropColumn('parentesco');
        });
    }
};
