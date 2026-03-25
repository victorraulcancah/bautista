<?php

namespace App\Exceptions;

use Exception;

class UserInactiveException extends Exception
{
    public function __construct()
    {
        parent::__construct('Usuario inactivo o bloqueado.', 403);
    }
}
