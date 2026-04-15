<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HorariosAsistenciaSeeder extends Seeder
{
    public function run(): void
    {
        // Verificar si existe al menos una institución
        $institucion = DB::table('institucion_educativa')->first();
        
        if (!$institucion) {
            $this->command->warn('⚠️  No hay instituciones en la base de datos.');
            $this->command->info('💡 El seeder de horarios de asistencia requiere al menos una institución.');
            return;
        }

        $instiId = $institucion->insti_id;
        
        $this->command->info('🏫 Institución encontrada: ID ' . $instiId);
        $this->command->info('⏰ Creando horarios de asistencia...');

        // Obtener niveles educativos
        $niveles = DB::table('niveles_educativos')->get();
        
        if ($niveles->isEmpty()) {
            $this->command->warn('⚠️  No hay niveles educativos en la base de datos.');
            $this->command->info('💡 Creando niveles educativos por defecto...');
            
            // Crear niveles educativos básicos
            $nivelesData = [
                ['nombre_nivel' => 'Inicial', 'created_at' => now(), 'updated_at' => now()],
                ['nombre_nivel' => 'Primaria', 'created_at' => now(), 'updated_at' => now()],
                ['nombre_nivel' => 'Secundaria', 'created_at' => now(), 'updated_at' => now()],
            ];
            
            DB::table('niveles_educativos')->insert($nivelesData);
            $this->command->info('✅ Niveles educativos creados: Inicial, Primaria, Secundaria');
            
            // Recargar niveles
            $niveles = DB::table('niveles_educativos')->get();
        }

        $this->command->info('📚 Niveles encontrados: ' . $niveles->count());

        // Crear horarios de asistencia por nivel educativo
        $horarios = [];
        
        foreach ($niveles as $nivel) {
            // Horario para ESTUDIANTES - Turno Mañana
            $horarios[] = [
                'insti_id' => $instiId,
                'nivel_id' => $nivel->nivel_id,
                'tipo_usuario' => 'E', // Estudiante
                'turno' => 'M', // Mañana
                'hora_ingreso' => '07:30:00',
                'hora_salida' => '13:00:00',
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Horario para ESTUDIANTES - Turno Tarde (opcional)
            $horarios[] = [
                'insti_id' => $instiId,
                'nivel_id' => $nivel->nivel_id,
                'tipo_usuario' => 'E', // Estudiante
                'turno' => 'T', // Tarde
                'hora_ingreso' => '13:30:00',
                'hora_salida' => '18:00:00',
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Horario para DOCENTES - Turno Mañana
            $horarios[] = [
                'insti_id' => $instiId,
                'nivel_id' => $nivel->nivel_id,
                'tipo_usuario' => 'D', // Docente
                'turno' => 'M', // Mañana
                'hora_ingreso' => '07:00:00',
                'hora_salida' => '14:00:00',
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Horario para DOCENTES - Turno Tarde
            $horarios[] = [
                'insti_id' => $instiId,
                'nivel_id' => $nivel->nivel_id,
                'tipo_usuario' => 'D', // Docente
                'turno' => 'T', // Tarde
                'hora_ingreso' => '13:00:00',
                'hora_salida' => '19:00:00',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Insertar todos los horarios
        DB::table('horarios_asistencia')->insert($horarios);

        $this->command->info('✅ Horarios de asistencia creados: ' . count($horarios) . ' registros');
        $this->command->info('');
        $this->command->info('📋 Resumen:');
        $this->command->info('   • Estudiantes Turno Mañana: 07:30 - 13:00');
        $this->command->info('   • Estudiantes Turno Tarde:  13:30 - 18:00');
        $this->command->info('   • Docentes Turno Mañana:    07:00 - 14:00');
        $this->command->info('   • Docentes Turno Tarde:     13:00 - 19:00');
        $this->command->info('');
        $this->command->info('💡 Puedes modificar estos horarios desde:');
        $this->command->info('   👉 http://localhost:8000/horarios');
    }
}
