<?php

namespace App\Actions\Fortify;

use App\Models\LoginHistory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthenticateLoginAttempt
{
    public function __invoke(Request $request): ?User
    {
        $user = User::where('username', $request->username)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return null;
        }

        if (! $user->isActivo()) {
            return null;
        }

        // Registrar historial de acceso
        LoginHistory::create([
            'user_id'    => $user->id,
            'ip_address' => $request->ip(),
            'device'     => $this->detectDevice($request),
            'tipo'       => '1', // login
        ]);

        return $user;
    }

    private function detectDevice(Request $request): string
    {
        $userAgent = strtolower($request->userAgent() ?? '');

        if (str_contains($userAgent, 'mobile') || str_contains($userAgent, 'android')) {
            return 'mobile';
        }

        if (str_contains($userAgent, 'tablet') || str_contains($userAgent, 'ipad')) {
            return 'tablet';
        }

        return 'desktop';
    }
}
