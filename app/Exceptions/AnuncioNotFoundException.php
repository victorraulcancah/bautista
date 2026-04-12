<?php

namespace App\Exceptions;

use Exception;

class AnuncioNotFoundException extends Exception
{
    public function __construct(string $message = 'Anuncio no encontrado', int $code = 404)
    {
        parent::__construct($message, $code);
    }

    public function render()
    {
        return response()->json([
            'message' => $this->getMessage(),
            'error' => 'ANUNCIO_NOT_FOUND'
        ], $this->getCode());
    }
}
