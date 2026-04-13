<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ConfiguracionFotocheck;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ConfiguracionFotocheckApiController extends Controller
{
    /**
     * Get the current configuration.
     */
    public function index()
    {
        return response()->json(ConfiguracionFotocheck::first() ?? new ConfiguracionFotocheck());
    }

    /**
     * Update the configuration.
     */
    public function update(Request $request)
    {
        $config = ConfiguracionFotocheck::firstOrCreate(['id' => 1]);

        $validated = $request->validate([
            'primary_color'   => 'nullable|string|max:7',
            'secondary_color' => 'nullable|string|max:7',
            'text_color'      => 'nullable|string|max:7',
            'footer_text'     => 'nullable|string|max:255',
            'logo'            => 'nullable|image|max:2048',
            'is_active'       => 'nullable|boolean',
        ]);

        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($config->logo_path) {
                Storage::disk('public')->delete($config->logo_path);
            }
            $validated['logo_path'] = $request->file('logo')->store('config', 'public');
        }

        $config->update($validated);

        return response()->json([
            'message' => 'Configuración actualizada correctamente',
            'config'  => $config
        ]);
    }
}
