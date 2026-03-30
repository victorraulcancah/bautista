<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocenteHorario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocenteHorarioApiController extends Controller
{
    public function index(int $docenteId): JsonResponse
    {
        $archivos = DocenteHorario::where('docente_id', $docenteId)
            ->latest('horario_archivo_id')
            ->get()
            ->map(fn ($a) => [
                'horario_archivo_id' => $a->horario_archivo_id,
                'nombre'             => $a->nombre,
                'url'                => asset('storage/' . $a->path),
                'created_at'         => $a->created_at?->format('d/m/Y'),
            ]);

        return response()->json($archivos);
    }

    public function store(Request $request, int $docenteId): JsonResponse
    {
        $request->validate(['archivo' => ['required', 'file', 'max:20480']]);

        $file = $request->file('archivo');
        $path = $file->store("docentes/{$docenteId}/horarios", 'public');

        $archivo = DocenteHorario::create([
            'docente_id' => $docenteId,
            'nombre'     => $file->getClientOriginalName(),
            'path'       => $path,
            'tipo'       => $file->getMimeType(),
            'tamanio'    => $file->getSize(),
        ]);

        return response()->json([
            'horario_archivo_id' => $archivo->horario_archivo_id,
            'nombre'             => $archivo->nombre,
            'url'                => asset('storage/' . $archivo->path),
        ], 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $archivo = DocenteHorario::findOrFail($id);
        Storage::disk('public')->delete($archivo->path);
        $archivo->delete();

        return response()->json(null, 204);
    }
}
