<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class HorarioNotFoundException extends Exception
{
    public function __construct(string $tipo = 'Horario', int $id = null)
    {
        $message = $id 
            ? "{$tipo} con ID {$id} no encontrado"
            : "{$tipo} no encontrado";
        
        parent::__construct($message);
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage()
        ], 404);
    }
}
