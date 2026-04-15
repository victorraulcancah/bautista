<?php

namespace Database\Seeders;

use App\Models\Curso;
use App\Models\Docente;
use App\Models\HorarioBloque;
use App\Models\HorarioClase;
use App\Models\Seccion;
use Illuminate\Database\Seeder;

class HorarioClasesSeeder extends Seeder
{
    public function run(): void
    {
        // Verificar si existe al menos una institución
        $institucion = \DB::table('institucion_educativa')->first();
        
        if (!$institucion) {
            $this->command->warn('⚠️  No hay instituciones en la base de datos.');
            return;
        }

        $instiId = $institucion->insti_id;
        $anioEscolar = date('Y');

        $this->command->info('🏫 Institución encontrada: ID ' . $instiId);
        $this->command->info('📚 Creando bloques horarios...');

        // 1. Crear bloques horarios estándar
        $bloques = [
            ['nombre' => '1ra Hora', 'hora_inicio' => '08:00', 'hora_fin' => '09:00', 'orden' => 1, 'es_recreo' => false],
            ['nombre' => '2da Hora', 'hora_inicio' => '09:00', 'hora_fin' => '10:00', 'orden' => 2, 'es_recreo' => false],
            ['nombre' => 'Recreo', 'hora_inicio' => '10:00', 'hora_fin' => '10:30', 'orden' => 3, 'es_recreo' => true],
            ['nombre' => '3ra Hora', 'hora_inicio' => '10:30', 'hora_fin' => '11:30', 'orden' => 4, 'es_recreo' => false],
            ['nombre' => '4ta Hora', 'hora_inicio' => '11:30', 'hora_fin' => '12:30', 'orden' => 5, 'es_recreo' => false],
            ['nombre' => 'Almuerzo', 'hora_inicio' => '12:30', 'hora_fin' => '14:00', 'orden' => 6, 'es_recreo' => true],
            ['nombre' => '5ta Hora', 'hora_inicio' => '14:00', 'hora_fin' => '15:00', 'orden' => 7, 'es_recreo' => false],
            ['nombre' => '6ta Hora', 'hora_inicio' => '15:00', 'hora_fin' => '16:00', 'orden' => 8, 'es_recreo' => false],
        ];

        foreach ($bloques as $bloque) {
            HorarioBloque::firstOrCreate(
                [
                    'insti_id' => $instiId,
                    'nombre' => $bloque['nombre'],
                ],
                $bloque + ['insti_id' => $instiId]
            );
        }

        $this->command->info('✅ Bloques horarios creados');

        // 2. Crear clases de ejemplo
        $this->command->info('📝 Creando clases de ejemplo...');

        $seccion = Seccion::first();
        $cursos = Curso::limit(5)->get();
        $docentes = Docente::limit(5)->get();

        if (!$seccion || $cursos->isEmpty() || $docentes->isEmpty()) {
            $this->command->warn('⚠️  No hay suficientes datos para crear clases de ejemplo');
            $this->command->info('💡 Crea clases manualmente desde: http://localhost:8000/horario-clases');
            return;
        }

        $clasesCreadas = 0;

        // Horario de ejemplo para la primera sección
        $horarioEjemplo = [
            // Lunes
            ['dia' => 1, 'hora_inicio' => '08:00', 'hora_fin' => '09:00', 'curso_idx' => 0, 'docente_idx' => 0],
            ['dia' => 1, 'hora_inicio' => '09:00', 'hora_fin' => '10:00', 'curso_idx' => 1, 'docente_idx' => 1],
            ['dia' => 1, 'hora_inicio' => '10:30', 'hora_fin' => '11:30', 'curso_idx' => 2, 'docente_idx' => 2],
            ['dia' => 1, 'hora_inicio' => '11:30', 'hora_fin' => '12:30', 'curso_idx' => 3, 'docente_idx' => 3],
            
            // Martes
            ['dia' => 2, 'hora_inicio' => '08:00', 'hora_fin' => '09:00', 'curso_idx' => 1, 'docente_idx' => 1],
            ['dia' => 2, 'hora_inicio' => '09:00', 'hora_fin' => '10:00', 'curso_idx' => 0, 'docente_idx' => 0],
            ['dia' => 2, 'hora_inicio' => '10:30', 'hora_fin' => '11:30', 'curso_idx' => 4, 'docente_idx' => 4],
            
            // Miércoles
            ['dia' => 3, 'hora_inicio' => '08:00', 'hora_fin' => '09:00', 'curso_idx' => 2, 'docente_idx' => 2],
            ['dia' => 3, 'hora_inicio' => '09:00', 'hora_fin' => '10:00', 'curso_idx' => 3, 'docente_idx' => 3],
            ['dia' => 3, 'hora_inicio' => '10:30', 'hora_fin' => '11:30', 'curso_idx' => 0, 'docente_idx' => 0],
            
            // Jueves
            ['dia' => 4, 'hora_inicio' => '08:00', 'hora_fin' => '09:00', 'curso_idx' => 4, 'docente_idx' => 4],
            ['dia' => 4, 'hora_inicio' => '09:00', 'hora_fin' => '10:00', 'curso_idx' => 1, 'docente_idx' => 1],
            
            // Viernes
            ['dia' => 5, 'hora_inicio' => '08:00', 'hora_fin' => '09:00', 'curso_idx' => 3, 'docente_idx' => 3],
            ['dia' => 5, 'hora_inicio' => '09:00', 'hora_fin' => '10:00', 'curso_idx' => 2, 'docente_idx' => 2],
        ];

        foreach ($horarioEjemplo as $clase) {
            if (isset($cursos[$clase['curso_idx']]) && isset($docentes[$clase['docente_idx']])) {
                HorarioClase::create([
                    'seccion_id' => $seccion->seccion_id,
                    'curso_id' => $cursos[$clase['curso_idx']]->curso_id,
                    'docente_id' => $docentes[$clase['docente_idx']]->docente_id,
                    'dia_semana' => $clase['dia'],
                    'hora_inicio' => $clase['hora_inicio'],
                    'hora_fin' => $clase['hora_fin'],
                    'aula' => 'Aula ' . rand(101, 110),
                    'anio_escolar' => $anioEscolar,
                    'activo' => true,
                ]);
                $clasesCreadas++;
            }
        }

        $this->command->info("✅ {$clasesCreadas} clases de ejemplo creadas");
        $this->command->newLine();
        $this->command->info('💡 Visualiza el horario en:');
        $this->command->info("   👉 http://localhost:8000/horario-clases");
        $this->command->newLine();
        $this->command->info('📋 Resumen:');
        $this->command->info("   • Sección: {$seccion->nombre}");
        $this->command->info("   • Año escolar: {$anioEscolar}");
        $this->command->info("   • Clases creadas: {$clasesCreadas}");
    }
}
