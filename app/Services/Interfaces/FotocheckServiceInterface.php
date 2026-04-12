<?php

namespace App\Services\Interfaces;

use Illuminate\Http\Response;

interface FotocheckServiceInterface
{
    /**
     * Generate ID card for a specific user ID.
     */
    public function generateForId(int $id): Response;

    /**
     * Generate ID card for the currently authenticated user.
     */
    public function generateForAuthUser(): Response;

    /**
     * Generate multiple ID cards in a single PDF.
     */
    public function generateBulk(int $aperturaId, int $nivelId): Response;
}
