<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $perm = \Spatie\Permission\Models\Permission::firstOrCreate(['name' => 'perfil.ver_credencial', 'guard_name' => 'web']);
        
        $roles = \Spatie\Permission\Models\Role::whereIn('name', ['estudiante', 'docente', 'psicologo', 'administrador'])->get();
        foreach ($roles as $role) {
            $role->givePermissionTo($perm);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $perm = \Spatie\Permission\Models\Permission::where('name', 'perfil.ver_credencial')->first();
        if ($perm) {
            $perm->delete();
        }
    }
};
