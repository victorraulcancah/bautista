<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\InstitucionEducativa;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SystemAppearanceController extends Controller
{
    /**
     * Store system appearance settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'logo' => ['nullable', 'image', 'max:2048'],
            'background' => ['nullable', 'image', 'max:5120'],
        ]);

        $user = $request->user();
        $institucion = InstitucionEducativa::findOrFail($user->insti_id);

        if ($request->hasFile('logo')) {
            // Borrar antiguo si existe
            if ($institucion->insti_logo) {
                Storage::disk('public')->delete($institucion->insti_logo);
            }
            $path = $request->file('logo')->store('branding/logos', 'public');
            $institucion->insti_logo = $path;
        }

        if ($request->hasFile('background')) {
            // Borrar antiguo si existe
            if ($institucion->insti_fondo_login) {
                Storage::disk('public')->delete($institucion->insti_fondo_login);
            }
            $path = $request->file('background')->store('branding/backgrounds', 'public');
            $institucion->insti_fondo_login = $path;
        }

        $institucion->save();

        return back()->with('status', 'Ajustes del sistema actualizados correctamente.');
    }
}
