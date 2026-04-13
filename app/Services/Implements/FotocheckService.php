<?php

namespace App\Services\Implements;

use App\Services\Interfaces\FotocheckServiceInterface;
use App\Repositories\Interfaces\FotocheckRepositoryInterface;
use App\Http\Resources\FotocheckDataResource;
use App\Exceptions\FotocheckException;
use App\Models\Estudiante;
use App\Models\Docente;
use App\Models\ConfiguracionFotocheck;
use Barryvdh\DomPDF\Facade\Pdf;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class FotocheckService implements FotocheckServiceInterface
{
    private $repository;

    public function __construct(FotocheckRepositoryInterface $repository)
    {
        $this->repository = $repository;
    }

    /**
     * @inheritDoc
     */
    public function generateForId(int $id): Response
    {
        $estudiante = $this->repository->findEstudianteById($id);
        if ($estudiante) {
            return $this->renderSingle($estudiante->user, 'ALUMNO(A)', 'EST-' . str_pad($estudiante->estu_id, 6, '0', STR_PAD_LEFT));
        }

        $docente = $this->repository->findDocenteById($id);
        if ($docente) {
            return $this->renderSingle($docente->user, 'DOCENTE', 'DOC-' . str_pad($docente->docente_id, 6, '0', STR_PAD_LEFT));
        }

        $user = $this->repository->findUserById($id);
        $roleName = $user->roles->first()?->name ?? 'USUARIO';
        return $this->renderSingle($user, strtoupper($roleName), 'USR-' . str_pad($user->id, 6, '0', STR_PAD_LEFT));
    }

    /**
     * @inheritDoc
     */
    public function generateForAuthUser(): Response
    {
        $user = Auth::user()->load(['perfil', 'roles']);
        
        $estudiante = Estudiante::where('user_id', $user->id)->first();
        if ($estudiante) {
            return $this->renderSingle($user, 'ALUMNO(A)', 'EST-' . str_pad($estudiante->estu_id, 6, '0', STR_PAD_LEFT));
        }

        $docente = Docente::where('id_usuario', $user->id)->first();
        if ($docente) {
            return $this->renderSingle($user, 'DOCENTE', 'DOC-' . str_pad($docente->docente_id, 6, '0', STR_PAD_LEFT));
        }

        $roleName = $user->roles->first()?->name ?? 'PERSONAL';
        return $this->renderSingle($user, strtoupper($roleName), 'ID-' . str_pad($user->id, 6, '0', STR_PAD_LEFT));
    }

    /**
     * @inheritDoc
     */
    public function generateBulk(int $aperturaId, int $nivelId): Response
    {
        $estudiantes = $this->repository->getEstudiantesForBulk($aperturaId, $nivelId);

        if ($estudiantes->isEmpty()) {
            throw FotocheckException::personaNotFound();
        }

        $fotochecksData = [];

        foreach ($estudiantes as $estudiante) {
            $preparedData = $this->prepareData($estudiante->user, 'ALUMNO(A)', 'EST-' . str_pad($estudiante->estu_id, 6, '0', STR_PAD_LEFT));
            $fotochecksData[] = $preparedData;
        }

        $pdf = Pdf::loadView('reportes.fotocheck-bulk', [
            'fotochecks' => $fotochecksData,
            'periodo'    => date('Y'),
        ])->setPaper('a4', 'portrait');

        $nivelNombre = $estudiantes->first()->matriculas->first()->seccion->grado->nivel->nombre_nivel ?? 'NIVEL';
        $filename = 'fotochecks_' . strtoupper($nivelNombre) . '_' . date('Y-m-d') . '.pdf';

        return $pdf->stream($filename);
    }

    /**
     * Internal helper to render a single PDF.
     */
    private function renderSingle($user, string $tipo, string $idDisplay): Response
    {
        $data = $this->prepareData($user, $tipo, $idDisplay);

        $customPaper = [0, 0, 153.07, 243.78];
        $pdf = Pdf::loadView('reportes.fotocheck', $data)
                  ->setPaper($customPaper, 'portrait');

        return $pdf->stream('fotocheck_' . $idDisplay . '.pdf');
    }

    /**
     * Prepare data using FotocheckDataResource (applied as array).
     */
    private function prepareData($user, string $tipo, string $idDisplay): array
    {
        // Generate QR
        $qrCode = new QrCode(
            data: $user->id . '',
            encoding: new Encoding('UTF-8'),
            errorCorrectionLevel: ErrorCorrectionLevel::Low,
            size: 120,
            margin: 0,
            roundBlockSizeMode: RoundBlockSizeMode::Margin
        );

        $writer = new PngWriter();
        $qrSrc  = $writer->write($qrCode)->getDataUri();

        // Process Photo
        $fotoPath = ($user->perfil && $user->perfil->foto_perfil) 
                    ? storage_path('app/public/' . $user->perfil->foto_perfil) 
                    : null;
        
        $defaultPath = public_path('images/default-avatar.png');
        $imgPath     = ($fotoPath && file_exists($fotoPath)) ? $fotoPath : $defaultPath;

        $fotoSrc = '';
        if (file_exists($imgPath)) {
            $mime    = mime_content_type($imgPath);
            $fotoSrc = 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($imgPath));
        }

        // Use Resource for standardized labels (manually mapping to array for blade)
        $resource = new FotocheckDataResource($user, $tipo, $idDisplay);
        $data = $resource->toArray(request());

        // Load Configuration
        $config = ConfiguracionFotocheck::where('is_active', true)->first() ?? new ConfiguracionFotocheck();

        return array_merge($data, [
            'qrSrc'   => $qrSrc,
            'fotoSrc' => $fotoSrc,
            'periodo' => $config->footer_text ?? date('Y'),
            'config'  => $config
        ]);
    }
}
