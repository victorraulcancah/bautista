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
        // Relación alumno ↔ padre/apoderado
        Schema::create('estudiante_contacto', function (Blueprint $table) {
            $table->unsignedBigInteger('estudiante_id');
            $table->unsignedBigInteger('contacto_id');
            $table->decimal('mensualidad', 10, 2)->default(0);
            $table->primary(['estudiante_id', 'contacto_id']);
            $table->timestamps();
        });

        // Pagos por alumno registrados por el padre/apoderado pagador
        Schema::create('pagos', function (Blueprint $table) {
            $table->id('pag_id');
            $table->unsignedBigInteger('insti_id')->nullable();
            $table->unsignedBigInteger('estudiante_id');           // FK estudiantes.estu_id
            $table->unsignedBigInteger('contacto_id')->nullable(); // FK padre_apoderado.id_contacto
            $table->year('pag_anual');
            $table->string('pag_mes', 20);                         // ENERO … DICIEMBRE
            $table->decimal('pag_monto', 14, 2)->default(0);       // Mensualidad
            $table->string('pag_nombre1', 50)->nullable();          // UNIFORME / OTROS / null
            $table->decimal('pag_otro1', 14, 2)->default(0);
            $table->string('pag_nombre2', 50)->nullable();
            $table->decimal('pag_otro2', 14, 2)->default(0);
            $table->decimal('total', 14, 2)->default(0);
            $table->char('pag_notifica', 2)->default('NO');        // SI / NO
            $table->date('pag_fecha')->nullable();
            $table->tinyInteger('estatus')->default(0);             // 0=Pendiente, 1=Pagado
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagos');
        Schema::dropIfExists('estudiante_contacto');
    }
};
