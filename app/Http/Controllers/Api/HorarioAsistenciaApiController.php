<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HorarioAsistencia;
use Illuminate\Http\Request;

class HorarioAsistenciaApiController extends Controller
{
    public function index()
    {
        return response()->json(HorarioAsistencia::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'hora_entrada' => 'required',
            'hora_salida' => 'required',
            'tolerancia_minutos' => 'nullable|integer',
        ]);

        $horario = HorarioAsistencia::create($validated);
        return response()->json($horario, 201);
    }

    public function show($id)
    {
        return response()->json(HorarioAsistencia::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $horario = HorarioAsistencia::findOrFail($id);
        $validated = $request->validate([
            'nombre' => 'required|string|max:100',
            'hora_entrada' => 'required',
            'hora_salida' => 'required',
            'tolerancia_minutos' => 'nullable|integer',
        ]);

        $horario->update($validated);
        return response()->json($horario);
    }

    public function destroy($id)
    {
        HorarioAsistencia::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
