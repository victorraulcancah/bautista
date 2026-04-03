<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MatriculaPadre;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MatriculaPadresController extends Controller
{
    /** Obtener el estado actual de la matrícula del padre */
    public function status(Request $request)
    {
        $user = $request->user();
        $padre = DB::table('padre_apoderado')->where('user_id', $user->id)->first();

        if (!$padre) {
            return response()->json(['message' => 'No es un perfil de padre'], 403);
        }

        $matricula = DB::table('matricula_padres as mp')
            ->join('grupo_matricula_padres as gmp', 'mp.matri_padre_id', '=', 'gmp.id_matricula')
            ->where('gmp.id_padre_apoderado', $padre->id_contacto)
            ->where('mp.periodo', date('Y'))
            ->select('mp.*')
            ->first();

        return response()->json(['matricula' => $matricula]);
    }

    /** Actualizar pasos del wizard */
    public function updateStep(Request $request)
    {
        $request->validate([
            'matri_padre_id' => 'required',
            'step' => 'required|string', // termino, datos_padres, datos_alumnos, estado_verifica
        ]);

        $column = $request->input('step');
        $id = $request->input('matri_padre_id');

        DB::table('matricula_padres')
            ->where('matri_padre_id', $id)
            ->update([
                $column => '1',
                'updated_at' => now()
            ]);

        return response()->json(['message' => 'Paso completado']);
    }

    /** Guardar datos de padres en el proceso de matrícula */
    public function savePadres(Request $request)
    {
        // En un sistema real, actualizaría padre_apoderado con el request->validated()
        return response()->json(['message' => 'Datos de padres guardados']);
    }

    /** Guardar datos de alumnos (hijos) */
    public function saveHijos(Request $request)
    {
        // Registro de estudiantes en pre-matrícula
        return response()->json(['message' => 'Datos de hijos guardados']);
    }
}
