<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('estudiante_contacto', function (Blueprint $table) {
            $table->decimal('mensualidad', 10, 2)->default(0)->after('contacto_id');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::table('estudiante_contacto', function (Blueprint $table) {
            $table->dropColumn(['mensualidad', 'created_at', 'updated_at']);
        });
    }
};
