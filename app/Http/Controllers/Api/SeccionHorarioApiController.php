<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SeccionHorario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SeccionHorarioApiController extends Controller
{
    public function index(int $seccionId): JsonResponse
    {
        $archivos = SeccionHorario::where('seccion_id', $seccionId)
            ->latest('horario_archivo_id')
            ->get()
            ->map(fn ($a) => [
                'horario_archivo_id' => $a->horario_archivo_id,
                'nombre'             => $a->nombre,
                'tipo'               => $a->tipo,
                'tamanio'            => $a->tamanio,
                'url'                => asset('storage/' . $a->path),
            ]);

        return response()->json($archivos);
    }

    public function store(Request $request, int $seccionId): JsonResponse
    {
        $request->validate([
            'archivo' => ['required', 'file', 'max:20480'],
        ]);

        $file   = $request->file('archivo');
        $path   = $file->store("secciones/{$seccionId}/horarios", 'public');

        $archivo = SeccionHorario::create([
            'seccion_id' => $seccionId,
            'nombre'     => $file->getClientOriginalName(),
            'path'       => $path,
            'tipo'       => $file->getMimeType(),
            'tamanio'    => $file->getSize(),
        ]);

        return response()->json([
            'horario_archivo_id' => $archivo->horario_archivo_id,
            'nombre'             => $archivo->nombre,
            'tipo'               => $archivo->tipo,
            'tamanio'            => $archivo->tamanio,
            'url'                => asset('storage/' . $archivo->path),
        ], 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $archivo = SeccionHorario::findOrFail($id);
        Storage::disk('public')->delete($archivo->path);
        $archivo->delete();

        return response()->json(null, 204);
    }
}
