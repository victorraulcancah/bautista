<?php

namespace App\Services\Interfaces;

interface HorarioServiceInterface
{
    public function obtenerHorarioSeccion(int $seccionId, ?int $anio = null): array;
    
    public function obtenerHorarioDocente(int $docenteId, ?int $anio = null): array;
    
    public function detectarConflictos(array $datos): array;
    
    public function calcularCargaHoraria(int $docenteId, ?int $anio = null): array;
    
    public function clonarHorario(int $seccionId, int $anioOrigen, int $anioDestino): int;
    
    public function obtenerBloquesHorarios(int $instiId): array;
}
