<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dir_departamento', function (Blueprint $table) {
            $table->id('dep_id');
            $table->string('dep_nombre', 300)->nullable();
            $table->string('dep_cod', 2)->nullable()->unique();
            $table->timestamps();
        });

        Schema::create('dir_provincia', function (Blueprint $table) {
            $table->id('pro_id');
            $table->string('pro_nombre', 150)->nullable();
            $table->string('dep_codigo', 2)->nullable();
            $table->string('pro_cod', 2)->nullable();
            $table->timestamps();

            $table->foreign('dep_codigo')->references('dep_cod')->on('dir_departamento')->restrictOnDelete();
        });

        Schema::create('dir_distrito', function (Blueprint $table) {
            $table->id('dis_id');
            $table->string('dis_nombre', 150)->nullable();
            $table->string('dis_codigo', 2)->nullable();
            $table->string('pro_codigo', 2)->nullable();
            $table->string('dep_codigo', 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dir_distrito');
        Schema::dropIfExists('dir_provincia');
        Schema::dropIfExists('dir_departamento');
    }
};
