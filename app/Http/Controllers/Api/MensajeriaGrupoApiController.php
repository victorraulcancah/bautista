<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Curso;
use App\Models\Estudiante;
use App\Models\Grado;
use App\Models\Seccion;
use App\Models\Matricula;
use App\Models\User;
use Spatie\Permission\Models\Role;
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
                'rol',
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

    public function grados(Request $request): JsonResponse
    {
        $grados = Grado::whereHas('nivel', fn($q) => $q->where('insti_id', $request->user()->insti_id))
            ->with(['nivel:nivel_id,nombre_nivel'])
            ->orderBy('nombre_grado')
            ->get();

        return response()->json($grados->map(fn ($g) => [
            'grado_id' => $g->grado_id,
            'nombre'   => $g->nombre_grado,
            'nivel'    => $g->nivel?->nombre_nivel,
        ]));
    }

    public function aulas(Request $request): JsonResponse
    {
        $secciones = Seccion::whereHas('grado.nivel', fn($q) => $q->where('insti_id', $request->user()->insti_id))
            ->with(['grado.nivel'])
            ->orderBy('nombre')
            ->get();

        return response()->json($secciones->map(fn ($s) => [
            'seccion_id' => $s->seccion_id,
            'nombre'     => $s->nombre,
            'grado'      => $s->grado?->nombre_grado,
            'nivel'      => $s->grado?->nivel?->nombre_nivel,
        ]));
    }

    public function alumnosPorGrado(Request $request, int $gradoId): JsonResponse
    {
        $estudiantes = Estudiante::where('insti_id', $request->user()->insti_id)
            ->where('estado', '1')
            ->whereIn('estu_id', Matricula::select('estu_id')
                ->whereIn('seccion_id', Seccion::where('id_grado', $gradoId)->select('seccion_id'))
            )
            ->whereHas('user', fn ($q) => $q->whereHas('rol', fn ($r) => $r->where('name', 'estudiante')))
            ->with('perfil:perfil_id,user_id,primer_nombre,apellido_paterno', 'user:id,username,insti_id')
            ->get();

        return response()->json($estudiantes->map(fn ($e) => [
            'user_id' => $e->user_id,
            'nombre'  => $e->perfil
                ? trim("{$e->perfil->primer_nombre} {$e->perfil->apellido_paterno}")
                : ($e->user?->username ?? '—'),
        ]));
    }

    public function alumnosPorAula(Request $request, int $aulaId): JsonResponse
    {
        $estudiantes = Estudiante::where('insti_id', $request->user()->insti_id)
            ->where('estado', '1')
            ->whereIn('estu_id', Matricula::select('estu_id')->where('seccion_id', $aulaId))
            ->whereHas('user', fn ($q) => $q->whereHas('rol', fn ($r) => $r->where('name', 'estudiante')))
            ->with('perfil:perfil_id,user_id,primer_nombre,apellido_paterno', 'user:id,username,insti_id')
            ->get();

        return response()->json($estudiantes->map(fn ($e) => [
            'user_id' => $e->user_id,
            'nombre'  => $e->perfil
                ? trim("{$e->perfil->primer_nombre} {$e->perfil->apellido_paterno}")
                : ($e->user?->username ?? '—'),
        ]));
    }

    public function rolesPersonal(Request $request): JsonResponse
    {
        // Definimos los roles que se consideran "Personal / Trabajadores"
        $staffRoles = ['administrador', 'docente', 'psicologo', 'usuario', 'vi'];
        
        $roles = Role::whereIn('name', $staffRoles)
            ->orderBy('name')
            ->get();

        return response()->json($roles->map(fn ($r) => [
            'id'     => $r->id,
            'nombre' => ucfirst($r->name),
        ]));
    }

    public function trabajadoresPorRol(Request $request, int $rolId): JsonResponse
    {
        $usuarios = User::where('insti_id', $request->user()->insti_id)
            ->where('rol_id', $rolId)
            ->where('estado', '1')
            ->with('perfil:perfil_id,user_id,primer_nombre,apellido_paterno')
            ->get();

        return response()->json($usuarios->map(fn ($u) => [
            'user_id' => $u->id,
            'nombre'  => $u->perfil
                ? trim("{$u->perfil->primer_nombre} {$u->perfil->apellido_paterno}")
                : $u->username,
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
            'user_ids' => ['required', 'string'], // or array if sending as JSON
            'foto'     => ['nullable', 'image', 'max:4096'],
        ]);

        $data = $request->only('nombre');
        
        // As it's FormData, user_ids might be a comma-separated string, array, or JSON string. Let's parse it safely:
        $userIds = $request->input('user_ids');
        if (is_string($userIds)) {
            $data['user_ids'] = json_decode($userIds, true) ?? explode(',', $userIds);
        } else {
            $data['user_ids'] = (array) $userIds;
        }

        if ($request->hasFile('foto')) {
            $file = $request->file('foto');
            $filename = \Illuminate\Support\Str::random(40) . '.' . $file->extension();
            $path = $file->storeAs("mensajeria/grupos", $filename, 'public');
            $data['foto'] = $path;
        }

        $grupo = $this->service->crear(
            instiId:   $request->user()->insti_id,
            docenteId: $request->user()->id,
            data:      $data,
        );

        return response()->json([
            'id'             => $grupo->id,
            'nombre'         => $grupo->nombre,
            'foto'           => $grupo->foto ? asset('storage/' . $grupo->foto) : null,
            'miembros_count' => $grupo->miembros_count ?? count($data['user_ids']),
        ], 201);
    }
}
