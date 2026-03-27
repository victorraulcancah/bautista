<?php

namespace Database\Seeders;

use App\Models\Estudiante;
use App\Models\PadreApoderado;
use App\Models\Pago;
use App\Models\Perfil;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PagosTestSeeder extends Seeder
{
    public function run(): void
    {
        $instiId = 1; // Asume que existe la institución con ID 1

        // Crear 5 padres/apoderados de prueba
        for ($i = 1; $i <= 5; $i++) {
            // Crear usuario
            $user = User::create([
                'insti_id' => $instiId,
                'username' => "padre{$i}",
                'name'     => "Padre {$i}",
                'email'    => "padre{$i}@test.com",
                'password' => Hash::make('12345678'),
                'estado'   => '1',
            ]);
            $user->assignRole('padre_familia');

            // Crear perfil
            $perfil = Perfil::create([
                'user_id'          => $user->id,
                'genero'           => $i % 2 === 0 ? 'M' : 'F',
                'primer_nombre'    => "Padre{$i}",
                'apellido_paterno' => "Apellido{$i}",
                'apellido_materno' => "Materno{$i}",
                'tipo_doc'         => 1,
                'doc_numero'       => str_pad(70000000 + $i, 8, '0', STR_PAD_LEFT),
                'telefono'         => "98765432{$i}",
            ]);

            // Crear padre/apoderado (pagador)
            $padre = PadreApoderado::create([
                'user_id'        => $user->id,
                'insti_id'       => $instiId,
                'nombres'        => "Padre{$i}",
                'apellidos'      => "Apellido{$i} Materno{$i}",
                'direccion'      => "Av. Test {$i}00",
                'telefono_1'     => "98765432{$i}",
                'tipo_doc'       => 1,
                'numero_doc'     => str_pad(70000000 + $i, 8, '0', STR_PAD_LEFT),
                'genero'         => $i % 2 === 0 ? 'M' : 'F',
                'es_pagador'     => '1',
                'email_contacto' => "padre{$i}@test.com",
                'estado'         => '1',
            ]);

            // Crear 1-2 estudiantes por padre
            $numEstudiantes = $i % 2 === 0 ? 2 : 1;
            
            for ($j = 1; $j <= $numEstudiantes; $j++) {
                // Crear usuario estudiante
                $estudianteUser = User::create([
                    'insti_id' => $instiId,
                    'username' => "estudiante{$i}_{$j}",
                    'name'     => "Estudiante {$i}-{$j}",
                    'email'    => "estudiante{$i}_{$j}@test.com",
                    'password' => Hash::make('12345678'),
                    'estado'   => '1',
                ]);
                $estudianteUser->assignRole('estudiante');

                // Crear perfil estudiante
                $estudiantePerfil = Perfil::create([
                    'user_id'          => $estudianteUser->id,
                    'genero'           => $j % 2 === 0 ? 'M' : 'F',
                    'primer_nombre'    => "Estudiante{$i}_{$j}",
                    'apellido_paterno' => "Apellido{$i}",
                    'apellido_materno' => "Materno{$i}",
                    'tipo_doc'         => 1,
                    'doc_numero'       => str_pad(80000000 + ($i * 10) + $j, 8, '0', STR_PAD_LEFT),
                ]);

                // Crear estudiante
                $estudiante = Estudiante::create([
                    'insti_id'  => $instiId,
                    'perfil_id' => $estudiantePerfil->perfil_id,
                    'user_id'   => $estudianteUser->id,
                    'estado'    => '1',
                ]);

                // Asociar estudiante con padre (tabla pivot)
                DB::table('estudiante_contacto')->insert([
                    'estudiante_id' => $estudiante->estu_id,
                    'contacto_id'   => $padre->id_contacto,
                    'mensualidad'   => 150.00 + ($i * 10), // Mensualidad variable
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]);

                // Crear algunos pagos de ejemplo
                $meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO'];
                foreach (array_slice($meses, 0, rand(2, 4)) as $mes) {
                    Pago::create([
                        'insti_id'      => $instiId,
                        'estudiante_id' => $estudiante->estu_id,
                        'contacto_id'   => $padre->id_contacto,
                        'pag_anual'     => '2026',
                        'pag_mes'       => $mes,
                        'pag_monto'     => 150.00 + ($i * 10),
                        'pag_nombre1'   => 'Matrícula',
                        'pag_otro1'     => 50.00,
                        'total'         => 200.00 + ($i * 10),
                        'pag_notifica'  => 'SI',
                        'pag_fecha'     => now()->subDays(rand(1, 30)),
                        'estatus'       => 1,
                    ]);
                }
            }
        }

        $this->command->info('✓ Creados 5 pagadores con estudiantes y pagos de prueba');
    }
}
