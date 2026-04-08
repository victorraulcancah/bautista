<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediosApiController extends Controller
{
    /**
     * List user media files.
     */
    public function index(Request $request)
    {
        $medios = Medio::where('user_id', $request->user()->id)
            ->orderBy('id_medio', 'desc')
            ->get();

        return response()->json($medios);
    }

    /**
     * Upload a new media file.
     */
    public function store(Request $request)
    {
        $request->validate([
            'archivo' => 'required|file|max:20480', // 20MB
        ]);

        $file = $request->file('archivo');
        $path = $file->store('mis_medios', 'public');

        $medio = Medio::create([
            'user_id' => $request->user()->id,
            'nombre' => $file->getClientOriginalName(),
            'tipo' => $file->getClientOriginalExtension(),
            'ruta' => $path,
        ]);

        return response()->json($medio);
    }

    /**
     * Delete a media file.
     */
    public function destroy(Request $request, int $id)
    {
        $medio = Medio::where('user_id', $request->user()->id)->findOrFail($id);
        Storage::disk('public')->delete($medio->ruta);
        $medio->delete();

        return response()->json(['message' => 'Eliminado correctamente.']);
    }
}
