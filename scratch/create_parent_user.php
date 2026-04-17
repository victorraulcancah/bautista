<?php

use App\Models\User;
use App\Models\PadreApoderado;
use Illuminate\Support\Facades\Hash;

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$email = 'marco.sayaverde@gmail.com';
$dni = '49009831';
$padreId = 1017;

echo "Iniciando creación de usuario para: $email\n";

try {
    // 1. Crear el usuario
    $user = User::create([
        'insti_id' => 8,
        'rol_id'   => 5, // Padre
        'username' => $dni,
        'name'     => $dni,
        'email'    => $email,
        'password' => Hash::make($dni),
        'estado'   => 1
    ]);

    echo "Usuario creado con ID: " . $user->id . "\n";

    // 2. Vincular con el registro de PadreApoderado
    $padre = PadreApoderado::find($padreId);
    if ($padre) {
        $padre->user_id = $user->id;
        $padre->save();
        echo "Vinculado correctamente al padre ID: $padreId\n";
    } else {
        echo "Error: No se encontró el registro del padre ID: $padreId\n";
    }

    // 3. Asignar rol de Spatie (si aplica)
    if (method_exists($user, 'assignRole')) {
        $user->assignRole('Padre');
        echo "Rol 'Padre' asignado correctamente.\n";
    }

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
