<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('institucion_educativa', function (Blueprint $table) {
            $table->id('insti_id');
            $table->string('insti_ruc', 20)->nullable();
            $table->string('insti_razon_social', 100)->nullable();
            $table->string('insti_direccion', 200)->nullable();
            $table->string('insti_telefono1', 20)->nullable();
            $table->string('insti_telefono2', 20)->nullable();
            $table->string('insti_email', 100)->nullable();
            $table->string('insti_director', 100)->nullable();
            $table->string('insti_ndni', 20)->nullable();
            $table->string('insti_logo', 200)->nullable();
            $table->tinyInteger('insti_estatus')->default(1)->comment('1: ACTIVO, 0: INACTIVO');
            $table->timestamps();
        });

        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique()->comment('administrador, docente, estudiante, padre_familia, madre_familia, apoderado, psicologo');
            $table->string('guard_name', 20)->default('web');
            $table->timestamps();
        });

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('insti_id')->nullable();
            $table->foreign('insti_id')->references('insti_id')->on('institucion_educativa')->nullOnDelete();
            $table->unsignedBigInteger('rol_id');
            $table->foreign('rol_id')->references('id')->on('roles')->restrictOnDelete();
            $table->string('username')->unique()->comment('DNI o usuario de acceso');
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->text('two_factor_secret')->nullable();
            $table->text('two_factor_recovery_codes')->nullable();
            $table->timestamp('two_factor_confirmed_at')->nullable();
            $table->char('estado', 1)->default('1')->comment('1=activo, 0=inactivo, 5=bloqueado');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('institucion_educativa');
    }
};
