<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActividadCurso;
use App\Models\Matricula;
use App\Models\NotaActividad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CalificacionApiController extends Controller
{
    /**
     * Get students and their grades for a specific activity.
     */
    public function indexByActivity(Request $request, int $actividadId)
    {
        $actividad = ActividadCurso::findOrFail($actividadId);
        
        // Find the section_id from request or default to first findable from DocenteCurso
        $seccionId = $request->input('seccion_id');
        $aperturaId = $request->input('apertura_id');

        if (!$seccionId || !$aperturaId) {
            return response()->json([
                'message' => 'Se requiere seccion_id y apertura_id para filtrar alumnos.',
            ], 422);
        }

        $estudiantes = Matricula::where('seccion_id', $seccionId)
            ->where('apertura_id', $aperturaId)
            ->with(['estudiante.perfil'])
            ->get()
            ->map(function ($m) use ($actividadId) {
                $e = $m->estudiante;
                $nota = NotaActividad::where('estu_id', $e->estu_id)
                    ->where('actividad_id', $actividadId)
                    ->first();

                return [
                    'estu_id'           => $e->estu_id,
                    'nombre_completo'   => $e->perfil?->nombre_ordenado,
                    'nota'              => $nota?->nota ?? '',
                    'observacion'       => $nota?->observacion ?? '',
                ];
            });

        return response()->json([
            'actividad'     => $actividad->nombre_actividad,
            'estudiantes'   => $estudiantes,
        ]);
    }

    /**
     * Batch save/update grades for an activity.
     */
    public function calificar(Request $request, int $actividadId)
    {
        // Support both batch format { notas: [...] } and single format { estu_id, nota, observacion }
        if ($request->has('notas')) {
            $request->validate([
                'notas'             => 'required|array',
                'notas.*.estu_id'   => 'required|integer',
                'notas.*.nota'      => 'nullable|string|max:10',
                'notas.*.obs'       => 'nullable|string',
            ]);
            $items = collect($request->notas)->map(fn($i) => [
                'estu_id' => $i['estu_id'],
                'nota'    => $i['nota'] ?? null,
                'obs'     => $i['obs'] ?? null,
            ]);
        } else {
            $request->validate([
                'nota'       => 'nullable|string|max:10',
                'observacion'=> 'nullable|string',
            ]);
            $estuId = $request->input('estu_id') ?? $request->input('estudiante_id') ?? $request->input('entrega_id');
            $items = collect([[
                'estu_id' => $estuId,
                'nota'    => $request->input('nota'),
                'obs'     => $request->input('observacion'),
            ]]);
        }

        DB::beginTransaction();
        try {
            foreach ($items as $item) {
                if (empty($item['nota']) && empty($item['obs'])) continue;
                NotaActividad::updateOrCreate(
                    ['estu_id' => $item['estu_id'], 'actividad_id' => $actividadId],
                    ['nota' => $item['nota'], 'observacion' => $item['obs'] ?? null, 'fecha_calificacion' => now()]
                );
            }
            DB::commit();
            return response()->json(['message' => 'Calificaciones guardadas correctamente.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al guardar: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get a complete grade matrix (Students x Activities) for a course assignment.
     */
    public function indexByCourse(int $docenteCursoId)
    {
        $dc = \App\Models\DocenteCurso::with('curso')->findOrFail($docenteCursoId);
        
        // 1. Get all gradable activities for this course
        $actividades = ActividadCurso::where('id_curso', $dc->curso_id)
            ->where('es_calificado', '1')
            ->orderBy('created_at', 'asc')
            ->get();

        // 2. Get all students in this section
        $matriculas = Matricula::where('seccion_id', $dc->seccion_id)
            ->where('apertura_id', $dc->apertura_id)
            ->with('estudiante.perfil')
            ->get();

        // 3. Get all grades for these students/activities
        $notas = NotaActividad::whereIn('actividad_id', $actividades->pluck('actividad_id'))
            ->whereIn('estu_id', $matriculas->pluck('estu_id'))
            ->get();

        // 4. Format Grade Matrix and calculate weighted averages if settings exist
        $settings = $dc->settings ?? [];
        $weights = $settings['weights'] ?? null; // e.g. { "1": 40, "2": 60 } where 1 is Tarea, 2 is Examen

        $estudiantes = $matriculas->map(function ($m) use ($actividades, $notas) {
            $e = $m->estudiante;
            $nombre = $e->perfil?->nombre_ordenado;
            
            $notasAlumno = $actividades->map(function ($act) use ($e, $notas) {
                $notaObj = $notas->where('estu_id', $e->estu_id)->where('actividad_id', $act->actividad_id)->first();
                return [
                    'actividad_id'    => $act->actividad_id,
                    'tipo_id'         => $act->id_tipo_actividad,
                    'nota'            => $notaObj?->nota ?? '',
                    'observacion'     => $notaObj?->observacion ?? '',
                    'entregado'       => !empty($notaObj?->archivo_entrega),
                    'fecha_entrega'   => $notaObj?->fecha_entrega,
                    'puntos_maximos'  => $act->puntos_maximos,
                    'peso_porcentaje' => $act->peso_porcentaje,
                ];
            });

            // Calculate Weighted Average
            $sumaPonderada = 0;
            foreach ($notasAlumno as $item) {
                $puntosObtenidos = is_numeric($item['nota']) ? floatval($item['nota']) : 0;
                $puntosMaximos = floatval($item['puntos_maximos'] ?: 20);
                $peso = floatval($item['peso_porcentaje'] ?: 0);

                // Escala 20: (obtenido/máximo) * 20
                $nota20 = ($puntosMaximos > 0) ? ($puntosObtenidos / $puntosMaximos) * 20 : 0;
                $sumaPonderada += ($nota20 * ($peso / 100));
            }

            return [
                'estu_id' => $e->estu_id,
                'nombre'  => $nombre,
                'notas'   => $notasAlumno,
                'promedio'=> round($sumaPonderada, 2),
            ];
        });

        return response()->json([
            'curso'       => $dc->curso->nombre,
            'actividades' => $actividades->map(fn($a) => [
                'id' => $a->actividad_id, 
                'nombre' => $a->nombre_actividad,
                'tipo_id' => $a->id_tipo_actividad
            ]),
            'estudiantes' => $estudiantes,
            'settings'    => $settings,
        ]);
    }

    /**
     * Export the grade matrix to Excel.
     */
    public function exportExcel(int $docenteCursoId)
    {
        $dc = \App\Models\DocenteCurso::with(['curso', 'seccion.grado'])->findOrFail($docenteCursoId);
        $matrixSync = $this->indexByCourse($docenteCursoId)->getData();
        
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Registro de Notas');

        // Header Info
        $sheet->setCellValue('A1', 'CURSO:');
        $sheet->setCellValue('B1', $dc->curso->nombre);
        $sheet->setCellValue('A2', 'GRADO:');
        $sheet->setCellValue('B2', $dc->seccion->grado->nombre_grado . ' - ' . $dc->seccion->nombre);
        $sheet->getStyle('A1:A2')->getFont()->setBold(true);

        // Table Header
        $sheet->setCellValue('A4', 'ESTUDIANTE');
        $col = 'B';
        foreach ($matrixSync->actividades as $act) {
            $sheet->setCellValue($col . '4', $act->nombre);
            $sheet->getStyle($col . '4')->getAlignment()->setTextRotation(90);
            $col++;
        }
        $sheet->setCellValue($col . '4', 'PROMEDIO');
        $sheet->getStyle('A4:' . $col . '4')->getFont()->setBold(true);
        $sheet->getStyle('A4:' . $col . '4')->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)->getStartColor()->setARGB('FFE0E0E0');

        // Data
        $row = 5;
        foreach ($matrixSync->estudiantes as $estu) {
            $sheet->setCellValue('A' . $row, $estu->nombre);
            $col = 'B';
            foreach ($estu->notas as $nota) {
                $sheet->setCellValue($col . $row, $nota->nota ?: '-');
                $col++;
            }
            $sheet->setCellValue($col . $row, $estu->promedio);
            
            // Color average if failing (< 11 or similar)
            if ($estu->promedio < 11) {
                $sheet->getStyle($col . $row)->getFont()->getColor()->setARGB(\PhpOffice\PhpSpreadsheet\Style\Color::COLOR_RED);
            }
            
            $row++;
        }

        // Auto size columns
        $sheet->getColumnDimension('A')->setAutoSize(true);

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        
        $fileName = 'registro_notas_' . str_replace(' ', '_', $dc->curso->nombre) . '.xlsx';
        $tempFile = tempnam(sys_get_temp_dir(), 'export');
        $writer->save($tempFile);

        return response()->download($tempFile, $fileName)->deleteFileAfterSend(true);
    }
}
