<?php

namespace App\Services\Implements;

use App\Exceptions\UserInactiveException;
use App\Models\LoginHistory;
use App\Models\User;
use App\Services\Interfaces\AuthServiceInterface;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService implements AuthServiceInterface
{
    public function login(string $username, string $password, string $deviceName, string $ipAddress): array
    {
        $user = $this->validateCredentials($username, $password);
        $this->validateUserStatus($user);
        
        $this->recordLogin($user->id, $ipAddress, $deviceName);
        $token = $user->createToken($deviceName)->plainTextToken;

        return [
            'token' => $token,
            'user' => $user,
        ];
    }

    public function logout(User $user, string $ipAddress, string $userAgent): void
    {
        $user->currentAccessToken()->delete();
        $this->recordLogout($user->id, $ipAddress, $userAgent);
    }

    private function validateCredentials(string $username, string $password): User
    {
        $user = User::where('username', $username)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['Las credenciales son incorrectas.'],
            ]);
        }

        return $user;
    }

    private function validateUserStatus(User $user): void
    {
        if (!$user->isActivo()) {
            throw new UserInactiveException();
        }
    }

    private function recordLogin(int $userId, string $ipAddress, string $device): void
    {
        LoginHistory::create([
            'user_id' => $userId,
            'ip_address' => $ipAddress,
            'device' => $device,
            'tipo' => '1',
        ]);
    }

    private function recordLogout(int $userId, string $ipAddress, string $device): void
    {
        LoginHistory::create([
            'user_id' => $userId,
            'ip_address' => $ipAddress,
            'device' => $device,
            'tipo' => '0',
        ]);
    }
}
