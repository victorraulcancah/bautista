<?php

namespace App\Exceptions;

use Exception;

class DocenteCursoNotFoundException extends Exception
{
    public function __construct(string $message = 'Asignación de curso no encontrada', int $code = 404)
    {
        parent::__construct($message, $code);
    }

    public function render()
    {
        return response()->json([
            'message' => $this->getMessage(),
            'error' => 'DOCENTE_CURSO_NOT_FOUND'
        ], $this->getCode());
    }
}
