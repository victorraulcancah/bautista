<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Estudiante;
use App\Models\Docente;
use App\Models\User;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\PngWriter;
use App\Services\Interfaces\FotocheckServiceInterface;
use Illuminate\Http\Response;

class FotocheckController extends Controller
{
    private $service;

    public function __construct(FotocheckServiceInterface $service)
    {
        $this->service = $service;
    }

    /**
     * Generate ID card for a specific user ID.
     */
    public function generate(int $id): Response
    {
        return $this->service->generateForId($id);
    }

    /**
     * Generate the ID card for the currently authenticated user.
     */
    public function generatePropio(Request $request): Response
    {
        return $this->service->generateForAuthUser();
    }

    /**
     * Bulk generate ID cards for a specific level.
     */
    public function generateBulk(int $aperturaId, int $nivelId): Response
    {
        return $this->service->generateBulk($aperturaId, $nivelId);
    }
}
