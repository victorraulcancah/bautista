<?php

namespace App\Exceptions;

use Exception;

class DocenteNotFoundException extends Exception
{
    public function __construct(string $message = 'Docente no encontrado', int $code = 404)
    {
        parent::__construct($message, $code);
    }

    public function render()
    {
        return response()->json([
            'message' => $this->getMessage(),
            'error' => 'DOCENTE_NOT_FOUND'
        ], $this->getCode());
    }
}
