<?php

namespace App\Services\Interfaces;

use App\Models\User;

interface AuthServiceInterface
{
    public function login(string $username, string $password, string $deviceName, string $ipAddress): array;
    
    public function logout(User $user, string $ipAddress, string $userAgent): void;
}
