<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Curso;
use App\Models\Estudiante;
use App\Services\Interfaces\MensajeriaGrupoServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MensajeriaGrupoApiController extends Controller
{
    public function __construct(
        private readonly MensajeriaGrupoServiceInterface $service,
    ) {}

    /** Cursos de la institución para el selector del modal de grupos */
    public function cursos(Request $request): JsonResponse
    {
        $cursos = Curso::where('id_insti', $request->user()->insti_id)
            ->where('estado', '1')
            ->with(['nivel:nivel_id,nombre_nivel', 'grado:grado_id,nombre_grado'])
            ->orderBy('nombre')
            ->get();

        return response()->json($cursos->map(fn ($c) => [
            'curso_id' => $c->curso_id,
            'nombre'   => $c->nombre,
            'nivel'    => $c->nivel?->nombre_nivel,
            'grado'    => $c->grado?->nombre_grado,
        ]));
    }

    /** Alumnos matriculados en el nivel+grado de un curso */
    public function alumnosPorCurso(Request $request, int $cursoId): JsonResponse
    {
        $curso = Curso::findOrFail($cursoId);

        $estudiantes = Estudiante::where('insti_id', $request->user()->insti_id)
            ->where('estado', '1')
            ->whereHas('user', fn ($q) => $q->whereHas(
                'roles',
                fn ($r) => $r->where('name', 'estudiante')
            ))
            ->when($curso->grado_academico, fn ($q) =>
                $q->whereHas('perfil')   // solo con perfil cargado
            )
            ->with('perfil:perfil_id,user_id,primer_nombre,apellido_paterno', 'user:id,username,insti_id')
            ->get();

        return response()->json($estudiantes->map(fn ($e) => [
            'user_id' => $e->user_id,
            'nombre'  => $e->perfil
                ? trim("{$e->perfil->primer_nombre} {$e->perfil->apellido_paterno}")
                : ($e->user?->username ?? '—'),
        ]));
    }

    public function index(Request $request): JsonResponse
    {
        $grupos = $this->service->listar(
            userId:  $request->user()->id,
            instiId: $request->user()->insti_id,
        );

        return response()->json($grupos->map(fn ($g) => [
            'id'             => $g->id,
            'nombre'         => $g->nombre,
            'miembros_count' => $g->miembros_count,
        ]));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'nombre'   => ['required', 'string', 'max:150'],
            'user_ids' => ['required', 'array', 'min:1'],
            'user_ids.*' => ['integer'],
        ]);

        $grupo = $this->service->crear(
            instiId:   $request->user()->insti_id,
            docenteId: $request->user()->id,
            data:      $request->only('nombre', 'user_ids'),
        );

        return response()->json([
            'id'             => $grupo->id,
            'nombre'         => $grupo->nombre,
            'miembros_count' => $grupo->miembros_count,
        ], 201);
    }
}
