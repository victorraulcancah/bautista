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
            $table->text('not_resumen')->nullable()->after('not_titulo');
            $table->dateTime('not_fecha_publicacion')->nullable()->after('not_fecha');
            $table->dateTime('not_fecha_expiracion')->nullable()->after('not_fecha_publicacion');
            $table->string('not_lugar_evento')->nullable()->after('not_imagen');
            $table->date('not_fecha_evento')->nullable()->after('not_lugar_evento');
            $table->longText('not_contenido_html')->nullable()->after('not_mensaje');
            $table->text('not_cita_autoridad')->nullable()->after('not_contenido_html');
            $table->text('not_cita_estudiante')->nullable()->after('not_cita_autoridad');
            $table->json('not_multimedia_json')->nullable()->after('not_cita_estudiante');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('institucion_noticias', function (Blueprint $table) {
            $table->dropColumn([
                'not_resumen',
                'not_fecha_publicacion',
                'not_fecha_expiracion',
                'not_lugar_evento',
                'not_fecha_evento',
                'not_contenido_html',
                'not_cita_autoridad',
                'not_cita_estudiante',
                'not_multimedia_json',
            ]);
        });
    }
};
