<?php

namespace Database\Seeders;

use App\Models\InstitucionEducativa;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Roles y permisos primero
        $this->call(RolePermissionSeeder::class);

        // Institución por defecto
        $institucion = InstitucionEducativa::firstOrCreate(
            ['insti_ruc' => '1111111111222'],
            [
                'insti_razon_social' => 'IEP BAUTISTA LA PASCANA',
                'insti_direccion'    => 'JR. ABRAHAM VALDELOMAR 496, COMAS',
                'insti_telefono1'    => '933 862 652',
                'insti_email'        => 'demo@gmail.com',
                'insti_director'     => 'LIC. ELIZABETH LLACTARIMAY',
                'insti_estatus'      => 1,
            ]
        );

        // Usuario administrador
        $admin = User::firstOrCreate(
            ['username' => 'admin'],
            [
                'insti_id' => $institucion->insti_id,
                'name'     => 'Administrador',
                'email'    => 'admin@bautista.edu.pe',
                'password' => Hash::make('bautista$2050$'),
                'estado'   => '1',
            ]
        );
        $admin->assignRole('administrador');
    }
}
