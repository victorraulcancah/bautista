<?php

namespace App\Services\Implements;

use App\Models\Anuncio;
use App\Models\DocenteCurso;
use App\Exceptions\AnuncioNotFoundException;
use App\Exceptions\DocenteCursoNotFoundException;
use App\Services\Interfaces\AnuncioServiceInterface;

class AnuncioService implements AnuncioServiceInterface
{
    public function obtenerAnunciosPaginados(int $docenteCursoId, int $perPage = 10): array
    {
        return Anuncio::where('docente_curso_id', $docenteCursoId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->toArray();
    }

    public function obtenerAnuncios(int $docenteCursoId): array
    {
        $dc = DocenteCurso::find($docenteCursoId);
        
        if (!$dc) {
            throw new DocenteCursoNotFoundException();
        }

        return Anuncio::where('docente_curso_id', $docenteCursoId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->all();
    }

    public function crearAnuncio(array $data): object
    {
        $dc = DocenteCurso::find($data['docente_curso_id']);
        
        if (!$dc) {
            throw new DocenteCursoNotFoundException();
        }

        return Anuncio::create($data);
    }

    public function actualizarAnuncio(int $anuncioId, array $data): object
    {
        $anuncio = Anuncio::find($anuncioId);
        
        if (!$anuncio) {
            throw new AnuncioNotFoundException();
        }

        $anuncio->update($data);
        return $anuncio->fresh();
    }

    public function eliminarAnuncio(int $anuncioId): void
    {
        $anuncio = Anuncio::find($anuncioId);
        
        if (!$anuncio) {
            throw new AnuncioNotFoundException();
        }

        $anuncio->delete();
    }
}
