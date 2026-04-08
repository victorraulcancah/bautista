<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Estudiante;
use Barryvdh\DomPDF\Facade\Pdf;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Http\Response;

class FotocheckController extends Controller
{
    public function generate(int $id): Response
    {
        $estudiante = Estudiante::with(['perfil', 'user'])->findOrFail($id);

        // ── Generar QR en base64 (PNG) ──────────────────────────────────
        $qrCode = new QrCode(
            data: $estudiante->estu_id . ',1',
            encoding: new Encoding('UTF-8'),
            errorCorrectionLevel: ErrorCorrectionLevel::Low,
            size: 120,
            margin: 0,
            roundBlockSizeMode: RoundBlockSizeMode::Margin
        );

        $writer = new PngWriter();
        $result = $writer->write($qrCode);
        $qrSrc  = $result->getDataUri();

        // ── Foto del estudiante en base64 ────────────────────────────────
        $fotoPath    = public_path('images/fotos_alumnos/' . $estudiante->foto);
        $defaultPath = public_path('images/default-avatar.png');
        $imgPath     = (file_exists($fotoPath) && !empty($estudiante->foto))
                        ? $fotoPath
                        : $defaultPath;

        $fotoSrc = '';
        if (file_exists($imgPath)) {
            $mime    = mime_content_type($imgPath);
            $fotoSrc = 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($imgPath));
        }

        // ── Renderizar PDF ───────────────────────────────────────────────
        // Dimensiones carnet ID: 53.98 mm × 85.6 mm  ≈  153pt × 243pt
        $customPaper = [0, 0, 153.07, 243.78];

        $pdf = Pdf::loadView('reportes.fotocheck', [
                    'estudiante' => $estudiante,
                    'qrSrc'      => $qrSrc,
                    'fotoSrc'    => $fotoSrc,
                    'periodo'    => date('Y'),
                 ])
                 ->setPaper($customPaper, 'portrait');

        $filename = 'fotocheck_EST-' . str_pad($estudiante->estu_id, 6, '0', STR_PAD_LEFT) . '.pdf';

        return $pdf->stream($filename);
    }

    public function generateBulk(int $aperturaId, int $nivelId): Response
    {
        $estudiantes = Estudiante::with(['perfil', 'user'])
            ->whereHas('matriculas', function ($query) use ($aperturaId, $nivelId) {
                $query->where('apertura_id', $aperturaId)
                      ->whereHas('seccion.grado', function ($q) use ($nivelId) {
                          $q->where('nivel_id', $nivelId);
                      });
            })
            ->orderBy('estu_id')
            ->get();

        if ($estudiantes->isEmpty()) {
            abort(404, 'No se encontraron estudiantes matriculados en este nivel');
        }

        $fotochecksData = [];

        foreach ($estudiantes as $estudiante) {
            // ── Generar QR ──────────────────────────────────────────────
            $qrCode = new QrCode(
                data: $estudiante->estu_id . ',1',
                encoding: new Encoding('UTF-8'),
                errorCorrectionLevel: ErrorCorrectionLevel::Low,
                size: 120,
                margin: 0,
                roundBlockSizeMode: RoundBlockSizeMode::Margin
            );

            $writer = new PngWriter();
            $result = $writer->write($qrCode);
            $qrSrc  = $result->getDataUri();

            // ── Foto del estudiante ─────────────────────────────────────
            $fotoPath    = public_path('images/fotos_alumnos/' . $estudiante->foto);
            $defaultPath = public_path('images/default-avatar.png');
            $imgPath     = (file_exists($fotoPath) && !empty($estudiante->foto))
                            ? $fotoPath
                            : $defaultPath;

            $fotoSrc = '';
            if (file_exists($imgPath)) {
                $mime    = mime_content_type($imgPath);
                $fotoSrc = 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($imgPath));
            }

            $fotochecksData[] = [
                'estudiante' => $estudiante,
                'qrSrc'      => $qrSrc,
                'fotoSrc'    => $fotoSrc,
            ];
        }

        // ── Renderizar PDF con múltiples fotochecks ──────────────────────
        $pdf = Pdf::loadView('reportes.fotocheck-bulk', [
                    'fotochecks' => $fotochecksData,
                    'periodo'    => date('Y'),
                 ])
                 ->setPaper('a4', 'portrait');

        $nivelNombre = $estudiantes->first()->matriculas->first()->seccion->grado->nivel->nombre_nivel ?? 'NIVEL';
        $filename = 'fotochecks_' . strtoupper($nivelNombre) . '_' . date('Y-m-d') . '.pdf';

        return $pdf->stream($filename);
    }
}
