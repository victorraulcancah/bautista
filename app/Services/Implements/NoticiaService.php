<?php

namespace App\Services\Implements;

use App\Models\InstitucionNoticia;
use App\Repositories\Interfaces\NoticiaRepositoryInterface;
use App\Services\Interfaces\NoticiaServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;

class NoticiaService implements NoticiaServiceInterface
{
    public function __construct(
        private readonly NoticiaRepositoryInterface $repo,
    ) {}

    public function listar(int $instiId, string $search, int $perPage): LengthAwarePaginator
    {
        return $this->repo->paginate($instiId, $search, $perPage);
    }

    public function obtener(int $id): InstitucionNoticia
    {
        return $this->repo->findById($id);
    }

    public function crear(int $instiId, array $data): InstitucionNoticia
    {
        $payload = [
            'insti_id'              => $instiId,
            'not_titulo'            => strtoupper($data['not_titulo']),
            'not_resumen'           => $data['not_resumen'] ?? null,
            'not_mensaje'           => isset($data['not_mensaje']) ? strtoupper($data['not_mensaje']) : null,
            'not_contenido_html'    => $data['not_contenido_html'] ?? null,
            'not_cita_autoridad'    => $data['not_cita_autoridad'] ?? null,
            'not_cita_estudiante'   => $data['not_cita_estudiante'] ?? null,
            'not_multimedia_json'   => $data['not_multimedia_json'] ?? null,
            'not_lugar_evento'      => $data['not_lugar_evento'] ?? null,
            'not_fecha_evento'      => $data['not_fecha_evento'] ?? null,
            'not_fecha_publicacion' => $data['not_fecha_publicacion'] ?? null,
            'not_fecha_expiracion'  => $data['not_fecha_expiracion'] ?? null,
            'not_fecha'             => $data['not_fecha'] ?? now()->toDateString(),
            'autor'                 => $data['autor'] ?? null,
            'not_estatus'           => 1,
        ];

        if (isset($data['imagen'])) {
            $payload['not_imagen'] = $this->guardarImagen($data['imagen'], $payload['not_titulo']);
        }

        return $this->repo->create($payload);
    }

    public function actualizar(int $id, array $data): InstitucionNoticia
    {
        $noticia = $this->repo->findById($id);

        $payload = [];

        if (isset($data['not_titulo'])) {
            $payload['not_titulo'] = strtoupper($data['not_titulo']);
        }
        if (array_key_exists('not_resumen', $data)) {
            $payload['not_resumen'] = $data['not_resumen'];
        }
        if (array_key_exists('not_mensaje', $data)) {
            $payload['not_mensaje'] = isset($data['not_mensaje']) ? strtoupper($data['not_mensaje']) : null;
        }
        if (array_key_exists('not_contenido_html', $data)) {
            $payload['not_contenido_html'] = $data['not_contenido_html'];
        }
        if (array_key_exists('not_cita_autoridad', $data)) {
            $payload['not_cita_autoridad'] = $data['not_cita_autoridad'];
        }
        if (array_key_exists('not_cita_estudiante', $data)) {
            $payload['not_cita_estudiante'] = $data['not_cita_estudiante'];
        }
        if (array_key_exists('not_multimedia_json', $data)) {
            $payload['not_multimedia_json'] = $data['not_multimedia_json'];
        }
        if (array_key_exists('not_lugar_evento', $data)) {
            $payload['not_lugar_evento'] = $data['not_lugar_evento'];
        }
        if (array_key_exists('not_fecha_evento', $data)) {
            $payload['not_fecha_evento'] = $data['not_fecha_evento'];
        }
        if (array_key_exists('not_fecha_publicacion', $data)) {
            $payload['not_fecha_publicacion'] = $data['not_fecha_publicacion'];
        }
        if (array_key_exists('not_fecha_expiracion', $data)) {
            $payload['not_fecha_expiracion'] = $data['not_fecha_expiracion'];
        }
        if (isset($data['not_fecha'])) {
            $payload['not_fecha'] = $data['not_fecha'];
        }
        if (array_key_exists('autor', $data)) {
            $payload['autor'] = $data['autor'];
        }

        if (isset($data['imagen'])) {
            // Eliminar imagen anterior
            if ($noticia->not_imagen) {
                Storage::disk('public')->delete('noticias/' . $noticia->not_imagen);
            }
            $titulo = $payload['not_titulo'] ?? $noticia->not_titulo;
            $payload['not_imagen'] = $this->guardarImagen($data['imagen'], $titulo);
        }

        return $this->repo->update($id, $payload);
    }

    public function eliminar(int $id): void
    {
        $this->repo->delete($id);
    }

    private function guardarImagen(mixed $file, string $titulo): string
    {
        $ext      = $file->getClientOriginalExtension();
        $slug     = str(preg_replace('/[^A-Za-z0-9]/', '_', $titulo))->limit(50, '');
        $nombre   = 'NOT_' . $slug . '_' . time() . '.' . $ext;
        Storage::disk('public')->putFileAs('noticias', $file, $nombre);
        return $nombre;
    }
}
