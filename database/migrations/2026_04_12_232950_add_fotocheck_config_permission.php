<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Permission::firstOrCreate(['name' => 'configuracion.fotocheck', 'guard_name' => 'web']);
        
        $admin = Role::where('name', 'administrador')->first();
        if ($admin) {
            $admin->givePermissionTo('configuracion.fotocheck');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $permission = Permission::where('name', 'configuracion.fotocheck')->first();
        if ($permission) {
            $permission->delete();
        }
    }
};
