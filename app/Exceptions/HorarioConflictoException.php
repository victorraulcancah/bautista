<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class HorarioConflictoException extends Exception
{
    protected array $conflictos;

    public function __construct(array $conflictos, string $message = 'Se detectaron conflictos de horario')
    {
        parent::__construct($message);
        $this->conflictos = $conflictos;
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'conflictos' => $this->conflictos
        ], 422);
    }

    public function getConflictos(): array
    {
        return $this->conflictos;
    }
}
