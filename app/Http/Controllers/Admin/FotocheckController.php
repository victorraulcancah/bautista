<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Estudiante;
use Barryvdh\DomPDF\Facade\Pdf;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Http\Response;

class FotocheckController extends Controller
{
    public function generate(int $id): Response
    {
        $estudiante = Estudiante::with(['perfil', 'usuario'])->findOrFail($id);

        // ── Generar QR en base64 (PNG) ──────────────────────────────────
        $qrCode = QrCode::create($estudiante->estu_id . ',1')
            ->setSize(120)
            ->setMargin(0);
        $result    = (new PngWriter())->write($qrCode);
        $qrSrc     = 'data:image/png;base64,' . base64_encode($result->getString());

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
}
