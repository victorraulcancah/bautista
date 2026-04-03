<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePagoRequest;
use App\Http\Requests\UpdatePagoRequest;
use App\Http\Resources\EstudianteConPagadorResource;
use App\Http\Resources\PagadorResource;
use App\Http\Resources\PagoResource;
use App\Http\Resources\PagoNotificaResource;
use App\Services\Interfaces\PagoNotificaServiceInterface;
use App\Services\Interfaces\PagoServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class PagoApiController extends Controller
{
    public function __construct(
        private readonly PagoServiceInterface $service,
        private readonly PagoNotificaServiceInterface $notificaService,
    ) {}

    // ── Pagadores (lista principal) ────────────────────────────────────────

    public function indexPagadores(Request $request): AnonymousResourceCollection
    {
        // Lista de estudiantes con sus pagadores para la vista principal
        return EstudianteConPagadorResource::collection($this->service->listarEstudiantesConPagador(
            instiId: $request->user()->insti_id,
            search:  $request->get('search') ?? '',
            perPage: (int) ($request->get('per_page') ?? 20),
        ));
    }

    // ── Pagos por contacto ─────────────────────────────────────────────────

    public function porContacto(int $contactoId): AnonymousResourceCollection
    {
        return PagoResource::collection($this->service->pagosPorContacto($contactoId));
    }

    // ── CRUD de pagos ──────────────────────────────────────────────────────

    public function store(StorePagoRequest $request): JsonResponse
    {
        $pago = $this->service->crearPago(array_merge(
            $request->validated(),
            ['insti_id' => $request->user()->insti_id],
        ));

        return (new PagoResource($pago))->response()->setStatusCode(201);
    }

    public function update(UpdatePagoRequest $request, int $id): PagoResource
    {
        return new PagoResource($this->service->actualizarPago($id, $request->validated()));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->eliminarPago($id);
        return response()->json(null, 204);
    }

    // ── Vouchers / Comprobantes de pago ───────────────────────────────────

    public function vouchers(int $pagId): AnonymousResourceCollection
    {
        return PagoNotificaResource::collection($this->notificaService->listarPorPago($pagId));
    }

    public function subirVoucher(Request $request, int $pagId): JsonResponse
    {
        $request->validate([
            'archivo' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        $notifica = $this->notificaService->subirVoucher(
            pagId:   $pagId,
            userId:  $request->user()->id,
            archivo: $request->file('archivo'),
        );

        return (new PagoNotificaResource($notifica))->response()->setStatusCode(201);
    }

    public function validarVoucher(Request $request, int $notificaId): JsonResponse
    {
        $request->validate([
            'estado'     => ['required', Rule::in(['validado', 'rechazado'])],
            'comentario' => ['nullable', 'string', 'max:500'],
        ]);

        $notifica = $this->notificaService->validar(
            notificaId: $notificaId,
            estado:     $request->input('estado'),
            comentario: $request->input('comentario'),
        );

        return (new PagoNotificaResource($notifica))->response();
    }

    // ── Reporte PDF ────────────────────────────────────────────────────────

    public function reportePdf(Request $request)
    {
        $contactoId = $request->get('contacto_id');
        $estudianteId = $request->get('estudiante_id');
        $fechaInicio = $request->get('fecha_inicio');
        $fechaFin = $request->get('fecha_fin');

        $pagos = $this->service->pagosPorContacto((int) $contactoId);

        // Filtrar por fechas si se proporcionan
        if ($fechaInicio && $fechaFin) {
            $pagos = $pagos->filter(function ($pago) use ($fechaInicio, $fechaFin) {
                if (!$pago->pag_fecha) return false;
                $fecha = $pago->pag_fecha->format('Y-m-d');
                return $fecha >= $fechaInicio && $fecha <= $fechaFin;
            });
        }

        $total = $pagos->sum('total');

        // Obtener información del contacto
        $contacto = \App\Models\PadreApoderado::with('estudiantes')
            ->find($contactoId);

        $estudiante = $contacto->estudiantes->first();

        $subtitulo = '';
        if ($fechaInicio && $fechaFin) {
            $subtitulo = 'DESDE ' . date('d-m-Y', strtotime($fechaInicio)) . 
                        ' - HASTA ' . date('d-m-Y', strtotime($fechaFin));
        }

        $html = view('pdf.pagos', [
            'pagos' => $pagos,
            'total' => $total,
            'subtitulo' => $subtitulo,
            'contacto' => $contacto,
            'estudiante' => $estudiante,
        ])->render();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
        return $pdf->download('Reporte_Pagos.pdf');
    }
}