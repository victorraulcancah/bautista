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
     * Get a complete grade matrix (Students x Activities) grouped by unit for a course assignment.
     */
    public function indexByCourse(int $docenteCursoId)
    {
        $dc = \App\Models\DocenteCurso::with('curso')->findOrFail($docenteCursoId);

        // 1. Students in section (handle NULL apertura_id)
        $matriculasQuery = Matricula::where('seccion_id', $dc->seccion_id)
            ->where('estado', '1')
            ->with('estudiante.perfil');
        if ($dc->apertura_id) {
            $matriculasQuery->where('apertura_id', $dc->apertura_id);
        }
        $matriculas = $matriculasQuery->get();

        // 2. Gradable activities with their clase → unidad chain
        $actividades = ActividadCurso::where('id_curso', $dc->curso_id)
            ->where('es_calificado', '1')
            ->with(['clase.unidad', 'tipoActividad'])
            ->orderBy('created_at', 'asc')
            ->get();

        // 3. All grades
        $notas = NotaActividad::whereIn('actividad_id', $actividades->pluck('actividad_id'))
            ->whereIn('estu_id', $matriculas->pluck('estu_id'))
            ->get();

        // 4. Weights & tipo map
        $settings      = $dc->settings ?? [];
        $weightsByName = $settings['weights'] ?? null;
        $tiposMap      = \DB::table('tipo_actividad')
            ->whereIn('tipo_id', $actividades->pluck('id_tipo_actividad')->filter()->unique())
            ->pluck('nombre', 'tipo_id');

        // Helper: weighted average for a set of activity rows (each with tipo_id, nota, puntos_maximos)
        $calcPromedio = function (iterable $items) use ($weightsByName, $tiposMap): float {
            $items = collect($items);
            if ($weightsByName && count($weightsByName) > 0) {
                $promediosPorTipo = [];
                foreach ($items->groupBy('tipo_id') as $tipoId => $grupo) {
                    $nombre = $tiposMap[$tipoId] ?? null;
                    if (!$nombre) continue;
                    $suma = 0; $cnt = 0;
                    foreach ($grupo as $item) {
                        if (!is_numeric($item['nota'])) continue;
                        $max  = floatval($item['puntos_maximos'] ?: 20);
                        $nota20 = $max > 0 ? (floatval($item['nota']) / $max) * 20 : 0;
                        $suma += $nota20; $cnt++;
                    }
                    if ($cnt > 0) $promediosPorTipo[$nombre] = $suma / $cnt;
                }
                $pesoTotal = array_sum(array_map(
                    fn($t) => floatval($weightsByName[$t] ?? 0),
                    array_keys($promediosPorTipo),
                ));
                if ($pesoTotal <= 0) return 0;
                $sum = 0;
                foreach ($promediosPorTipo as $tipo => $prom) {
                    $sum += $prom * (floatval($weightsByName[$tipo] ?? 0) / $pesoTotal);
                }
                return round($sum, 2);
            }
            // Fallback: peso_porcentaje individual
            $sum = 0;
            foreach ($items as $item) {
                if (!is_numeric($item['nota'])) continue;
                $max    = floatval($item['puntos_maximos'] ?: 20);
                $peso   = floatval($item['peso_porcentaje'] ?: 0);
                $nota20 = $max > 0 ? (floatval($item['nota']) / $max) * 20 : 0;
                $sum   += $nota20 * ($peso / 100);
            }
            return round($sum, 2);
        };

        // 5. Group activities by unidad
        $actividadesPorUnidad = $actividades->groupBy(fn($a) => $a->clase?->unidad?->unidad_id ?? 0);
        $unidadesInfo = \App\Models\Unidad::where('curso_id', $dc->curso_id)
            ->orderBy('orden')
            ->get()
            ->keyBy('unidad_id');

        $unidades = $actividadesPorUnidad->map(function ($acts, $unidadId) use ($unidadesInfo, $matriculas, $notas, $calcPromedio) {
            $unidad = $unidadesInfo[$unidadId] ?? null;
            $actividadesCol = $acts->values();

            $estudiantesUnidad = $matriculas->map(function ($m) use ($actividadesCol, $notas, $calcPromedio) {
                $e = $m->estudiante;
                $filas = $actividadesCol->map(function ($act) use ($e, $notas) {
                    $notaObj = $notas->where('estu_id', $e->estu_id)->where('actividad_id', $act->actividad_id)->first();
                    return [
                        'actividad_id'   => $act->actividad_id,
                        'tipo_id'        => $act->id_tipo_actividad,
                        'nota'           => $notaObj?->nota ?? '',
                        'observacion'    => $notaObj?->observacion ?? '',
                        'entregado'      => $notaObj && (!empty($notaObj->archivo_entrega) || $notaObj->nota !== null || $notaObj->fecha_entrega !== null),
                        'puntos_maximos' => $act->puntos_maximos,
                        'peso_porcentaje'=> $act->peso_porcentaje,
                    ];
                });
                return [
                    'estu_id'        => $e->estu_id,
                    'promedio_unidad' => $calcPromedio($filas),
                    'notas'          => $filas,
                ];
            });

            return [
                'unidad_id' => $unidadId,
                'titulo'    => $unidad?->titulo ?? 'Sin unidad',
                'actividades' => $actividadesCol->map(fn($a) => [
                    'id'      => $a->actividad_id,
                    'nombre'  => $a->nombre_actividad,
                    'tipo'    => $a->tipoActividad?->nombre ?? '—',
                    'tipo_id' => $a->id_tipo_actividad,
                ]),
                'estudiantes' => $estudiantesUnidad,
            ];
        })->values();

        // 6. Final average per student = simple average of unit averages (units with grades only)
        $promediosFinales = $matriculas->mapWithKeys(function ($m) use ($unidades) {
            $promsUnidad = $unidades->map(fn($u) =>
                collect($u['estudiantes'])->firstWhere('estu_id', $m->estu_id)['promedio_unidad'] ?? 0
            )->filter(fn($p) => $p > 0);

            return [$m->estu_id => $promsUnidad->count() > 0 ? round($promsUnidad->avg(), 2) : 0];
        });

        $estudiantesFinales = $matriculas->map(function ($m) use ($promediosFinales) {
            return [
                'estu_id'  => $m->estu_id,
                'nombre'   => $m->estudiante?->perfil?->nombre_ordenado,
                'promedio' => $promediosFinales[$m->estu_id] ?? 0,
            ];
        });

        return response()->json([
            'curso'      => $dc->curso->nombre,
            'unidades'   => $unidades,
            'estudiantes'=> $estudiantesFinales,
            'settings'   => $settings,
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
