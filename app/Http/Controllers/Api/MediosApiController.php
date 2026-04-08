<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medio;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediosApiController extends Controller
{
    /**
     * List user media files and folders.
     */
    public function index(Request $request)
    {
        $carpetaId = $request->query('carpeta_id');

        $query = Medio::where('user_id', $request->user()->id);

        if ($carpetaId) {
            $query->where('carpeta_id', $carpetaId);
        } else {
            $query->whereNull('carpeta_id');
        }

        $medios = $query->orderBy('es_carpeta', 'desc')
            ->orderBy('nombre', 'asc')
            ->get();

        return response()->json($medios);
    }

    /**
     * Get folder breadcrumb path.
     */
    public function breadcrumb(Request $request, int $id)
    {
        $path = [];
        $carpeta = Medio::find($id);

        while ($carpeta) {
            array_unshift($path, [
                'id' => $carpeta->id_medio,
                'nombre' => $carpeta->nombre,
            ]);
            $carpeta = $carpeta->carpetaPadre;
        }

        return response()->json($path);
    }

    /**
     * Create a new folder.
     */
    public function createFolder(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'carpeta_id' => 'nullable|exists:mis_medios,id_medio',
        ]);

        $carpeta = Medio::create([
            'user_id' => $request->user()->id,
            'carpeta_id' => $request->carpeta_id,
            'es_carpeta' => true,
            'nombre' => $request->nombre,
        ]);

        return response()->json($carpeta);
    }

    /**
     * Update a folder name.
     */
    public function updateFolder(Request $request, int $id)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
        ]);

        $carpeta = Medio::where('user_id', $request->user()->id)
            ->where('es_carpeta', true)
            ->findOrFail($id);

        $carpeta->update([
            'nombre' => $request->nombre,
        ]);

        return response()->json($carpeta);
    }

    /**
     * Upload a new media file.
     */
    public function store(Request $request)
    {
        $request->validate([
            'archivo' => 'required|file|max:20480', // 20MB
            'carpeta_id' => 'nullable|exists:mis_medios,id_medio',
        ]);

        $file = $request->file('archivo');
        $path = $file->store('mis_medios', 'public');

        $medio = Medio::create([
            'user_id' => $request->user()->id,
            'carpeta_id' => $request->carpeta_id,
            'es_carpeta' => false,
            'nombre' => $file->getClientOriginalName(),
            'tipo' => $file->getClientOriginalExtension(),
            'ruta' => $path,
        ]);

        return response()->json($medio);
    }

    /**
     * Delete a media file or folder.
     */
    public function destroy(Request $request, int $id)
    {
        $medio = Medio::where('user_id', $request->user()->id)->findOrFail($id);

        if ($medio->es_carpeta) {
            // Eliminar recursivamente todo el contenido
            $this->deleteFolder($medio);
        } else {
            // Eliminar archivo
            if ($medio->ruta) {
                Storage::disk('public')->delete($medio->ruta);
            }
        }

        $medio->delete();

        return response()->json(['message' => 'Eliminado correctamente.']);
    }

    private function deleteFolder(Medio $carpeta)
    {
        $contenido = $carpeta->contenido;

        foreach ($contenido as $item) {
            if ($item->es_carpeta) {
                $this->deleteFolder($item);
            } else {
                if ($item->ruta) {
                    Storage::disk('public')->delete($item->ruta);
                }
            }
            $item->delete();
        }
    }
}
