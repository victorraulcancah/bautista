<?php

namespace App\Exceptions;

use Exception;

class FotocheckException extends Exception
{
    public static function personaNotFound(): self
    {
        return new self("No se encontró registro para la persona solicitada.", 404);
    }

    public static function generationFailed(string $message): self
    {
        return new self("Error al generar el fotocheck: {$message}", 500);
    }
}
