<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEstudianteRequest;
use App\Http\Requests\UpdateEstudianteRequest;
use App\Http\Resources\EstudianteResource;
use App\Models\Estudiante;
use App\Models\PadreApoderado;
use Illuminate\Support\Facades\DB;
use App\Services\Interfaces\EstudianteServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class EstudianteApiController extends Controller
{
    public function __construct(
        private readonly EstudianteServiceInterface $service,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        return EstudianteResource::collection($this->service->listar(
            instiId: $request->user()->insti_id,
            search:  $request->get('search') ?? '',
            perPage: (int) $request->get('per_page', 20),
        ));
    }

    public function show(int $id): EstudianteResource
    {
        return new EstudianteResource($this->service->obtener($id));
    }

    public function store(StoreEstudianteRequest $request): JsonResponse
    {
        $estudiante = $this->service->crear(array_merge(
            $request->validated(),
            ['insti_id' => $request->user()->insti_id],
        ));

        return (new EstudianteResource($estudiante))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateEstudianteRequest $request, int $id): EstudianteResource
    {
        return new EstudianteResource($this->service->actualizar($id, $request->validated()));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->eliminar($id);

        return response()->json(null, 204);
    }

    /** GET /api/estudiantes/{id}/contactos */
    public function contactos(int $id): JsonResponse
    {
        $estudiante = Estudiante::findOrFail($id);

        $contactos = $estudiante->contactos()->get()->keyBy('parentesco');

        $result = [];
        foreach (['padre', 'madre', 'apoderado'] as $tipo) {
            $c = $contactos->get($tipo);
            $result[$tipo] = $c ? [
                'id_contacto'    => $c->id_contacto,
                'nombres'        => $c->nombres,
                'apellidos'      => $c->apellidos,
                'email_contacto' => $c->email_contacto,
                'telefono_1'     => $c->telefono_1,
                'telefono_2'     => $c->telefono_2,
                'tipo_doc'       => $c->tipo_doc,
                'numero_doc'     => $c->numero_doc,
                'genero'         => $c->genero,
                'direccion'      => $c->direccion,
                'es_pagador'     => $c->es_pagador,
            ] : null;
        }

        return response()->json($result);
    }

    /** POST /api/estudiantes/{id}/contactos */
    public function guardarContacto(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'parentesco'     => ['required', 'in:padre,madre,apoderado'],
            'nombres'        => ['nullable', 'string', 'max:200'],
            'apellidos'      => ['nullable', 'string', 'max:200'],
            'email_contacto' => ['nullable', 'email', 'max:200'],
            'telefono_1'     => ['nullable', 'string', 'max:20'],
            'telefono_2'     => ['nullable', 'string', 'max:20'],
            'tipo_doc'       => ['nullable', 'integer'],
            'numero_doc'     => ['nullable', 'string', 'max:20'],
            'genero'         => ['nullable', 'in:M,F'],
            'direccion'      => ['nullable', 'string', 'max:200'],
            'es_pagador'     => ['nullable', 'string'],
        ]);

        $estudiante = Estudiante::findOrFail($id);

        $contacto = $estudiante->contactos()
            ->where('parentesco', $data['parentesco'])
            ->first();

        if ($contacto) {
            $contacto->update($data);
        } else {
            $data['insti_id'] = $request->user()->insti_id;

            // Crear usuario de acceso si tiene número de documento
            if (!empty($data['numero_doc'])) {
                $rolName = match($data['parentesco']) {
                    'madre'     => 'madre_familia',
                    'apoderado' => 'apoderado',
                    default     => 'padre_familia',
                };
                $existeUser = \App\Models\User::where('username', $data['numero_doc'])->first();
                if (!$existeUser) {
                    $existeUser = \App\Models\User::create([
                        'insti_id' => $request->user()->insti_id,
                        'rol_id'   => \DB::table('roles')->where('name', $rolName)->value('id'),
                        'username' => $data['numero_doc'],
                        'name'     => trim(($data['nombres'] ?? '') . ' ' . ($data['apellidos'] ?? '')),
                        'email'    => $data['email_contacto'] ?? null,
                        'password' => \Hash::make($data['numero_doc']),
                        'estado'   => '1',
                    ]);
                    $existeUser->assignRole($rolName);
                }
                $data['user_id'] = $existeUser->id;
            }

            $contacto = PadreApoderado::create($data);
            DB::table('estudiante_contacto')->insertOrIgnore([
                'estu_id'     => $estudiante->estu_id,
                'contacto_id' => $contacto->id_contacto,
            ]);
        }

        return response()->json(['ok' => true, 'id_contacto' => $contacto->id_contacto]);
    }
}
