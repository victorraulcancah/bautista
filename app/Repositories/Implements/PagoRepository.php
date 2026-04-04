<?php

namespace App\Repositories\Implements;

use App\Models\Estudiante;
use App\Models\Pago;
use App\Models\PadreApoderado;
use Illuminate\Support\Facades\DB;
use App\Repositories\Interfaces\PagoRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class PagoRepository implements PagoRepositoryInterface
{
    public function paginateEstudiantesConPagador(int $instiId, string $search = '', int $perPage = 20): LengthAwarePaginator
    {
        return DB::table('estudiantes as es')
            ->join('estudiante_contacto as ec', 'es.estu_id', '=', 'ec.estu_id')
            ->join('padre_apoderado as p', 'ec.contacto_id', '=', 'p.id_contacto')
            ->leftJoin('users as u', 'p.user_id', '=', 'u.id')
            ->leftJoin(DB::raw('(SELECT estu_id, COUNT(*) as pagos_count FROM pagos GROUP BY estu_id) as pag'), 'es.estu_id', '=', 'pag.estu_id')
            ->where('p.insti_id', $instiId)
            ->where('p.es_pagador', '1')
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sq) use ($search) {
                    $sq->where('p.nombres', 'like', "%{$search}%")
                       ->orWhere('p.apellidos', 'like', "%{$search}%")
                       ->orWhere('p.numero_doc', 'like', "%{$search}%");
                });
            })
            ->select([
                'u.id as id_usuario',
                'p.nombres',
                'p.apellidos',
                'p.telefono_1',
                'p.numero_doc',
                'ec.mensualidad',
                'es.estu_id',
                'p.id_contacto',
                DB::raw('COALESCE(pag.pagos_count, 0) as pagos_count')
            ])
            ->orderBy('es.estu_id', 'desc')
            ->paginate($perPage);
    }

    public function paginatePagadores(int $instiId, string $search = '', int $perPage = 20): LengthAwarePaginator
    {
        return PadreApoderado::with(['estudiantes.perfil'])
            ->withCount('pagos')
            ->where('insti_id', $instiId)
            ->where('es_pagador', '1')
            ->when($search, fn ($q) => $q
                ->where('nombres', 'like', "%{$search}%")
                ->orWhere('apellidos', 'like', "%{$search}%")
                ->orWhere('numero_doc', 'like', "%{$search}%")
            )
            ->latest('id_contacto')
            ->paginate($perPage);
    }

    public function pagosPorContacto(int $contactoId): Collection
    {
        return Pago::where('contacto_id', $contactoId)
            ->orderBy('pag_anual', 'desc')
            ->orderByRaw("FIELD(pag_mes, 'ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE') DESC")
            ->get();
    }

    public function findById(int $id): Pago
    {
        return Pago::findOrFail($id);
    }

    public function create(array $data): Pago
    {
        return Pago::create($data);
    }

    public function update(Pago $pago, array $data): Pago
    {
        $pago->update($data);
        return $pago->fresh();
    }

    public function delete(Pago $pago): void
    {
        $pago->delete();
    }
}