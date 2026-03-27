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
            'insti_id'    => $instiId,
            'not_titulo'  => strtoupper($data['not_titulo']),
            'not_mensaje' => isset($data['not_mensaje']) ? strtoupper($data['not_mensaje']) : null,
            'not_fecha'   => $data['not_fecha'] ?? now()->toDateString(),
            'not_estatus' => 1,
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
        if (array_key_exists('not_mensaje', $data)) {
            $payload['not_mensaje'] = isset($data['not_mensaje']) ? strtoupper($data['not_mensaje']) : null;
        }
        if (isset($data['not_fecha'])) {
            $payload['not_fecha'] = $data['not_fecha'];
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
        $nombre   = 'NOT_' . preg_replace('/[^A-Za-z0-9_-]/', '_', $titulo) . '.' . $ext;
        Storage::disk('public')->putFileAs('noticias', $file, $nombre);
        return $nombre;
    }
}
