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
        Schema::create('configuracion_fotochecks', function (Blueprint $table) {
            $table->id();
            $table->string('primary_color')->default('#2c63f2'); // Blue in the image
            $table->string('secondary_color')->default('#7b8780'); // Greyish background in the image
            $table->string('text_color')->default('#ffffff');
            $table->string('logo_path')->nullable();
            $table->string('footer_text')->default('Periodo Académico 2026');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('configuracion_fotochecks');
    }
};
