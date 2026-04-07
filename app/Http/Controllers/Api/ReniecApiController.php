<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ReniecApiController extends Controller
{
    /**
     * Consulta un DNI en APIPeru (apisperu.com)
     *
     * @param  string  $dni
     * @return \Illuminate\Http\JsonResponse
     */
    public function searchDni($dni)
    {
        $token = config('services.apisperu.token');
        $url   = config('services.apisperu.url');

        if (!$token || !$url) {
            return response()->json([
                'success' => false,
                'message' => 'Configuración de APIPeru no encontrada.'
            ], 500);
        }

        try {
            $response = Http::timeout(10)
                ->get("{$url}/dni/{$dni}", [
                    'token' => $token
                ]);

            if ($response->successful()) {
                $data = $response->json();
                
                // Formatear respuesta para el frontend
                return response()->json([
                    'success' => true,
                    'data' => [
                        'dni'              => $data['dni'] ?? $dni,
                        'nombres'          => $data['nombres'] ?? '',
                        'apellidoPaterno'  => $data['apellidoPaterno'] ?? '',
                        'apellidoMaterno'  => $data['apellidoMaterno'] ?? '',
                        'nombreCompleto'   => $data['nombreCompleto'] ?? '',
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'No se encontró información para el DNI proporcionado.'
            ], 404);

        } catch (\Exception $e) {
            Log::error("Error consultando DNI {$dni} en APIPeru: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al conectar con el servicio de consulta.'
            ], 500);
        }
    }
}
