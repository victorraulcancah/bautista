<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class UbigeoApiController extends Controller
{
    public function departamentos(): JsonResponse
    {
        $data = DB::table('dir_departamento')
            ->orderBy('dep_nombre')
            ->get(['dep_cod', 'dep_nombre']);

        return response()->json($data);
    }

    public function provincias(string $depCod): JsonResponse
    {
        $data = DB::table('dir_provincia')
            ->where('dep_codigo', $depCod)
            ->orderBy('pro_nombre')
            ->get(['pro_cod', 'pro_nombre', 'dep_codigo']);

        return response()->json($data);
    }

    public function distritos(string $depCod, string $proCod): JsonResponse
    {
        $data = DB::table('dir_distrito')
            ->where('dep_codigo', $depCod)
            ->where('pro_codigo', $proCod)
            ->orderBy('dis_nombre')
            ->get(['dis_codigo', 'dis_nombre']);

        return response()->json($data);
    }
}
