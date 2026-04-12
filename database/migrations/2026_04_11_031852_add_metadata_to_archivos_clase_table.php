<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('archivos_clase', function (Blueprint $table) {
            $table->string('titulo', 255)->nullable()->after('nombre');
            $table->text('descripcion')->nullable()->after('titulo');
            $table->char('visible', 1)->default('1')->after('tamanio')->comment('1=visible, 0=oculto');
        });
    }

    public function down(): void
    {
        Schema::table('archivos_clase', function (Blueprint $table) {
            $table->dropColumn(['titulo', 'descripcion', 'visible']);
        });
    }
};
