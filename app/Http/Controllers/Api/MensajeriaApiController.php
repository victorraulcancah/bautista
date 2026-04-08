<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MensajePrivado;
use App\Models\MensajePrivadoRespuesta;
use App\Models\User;
use Illuminate\Http\Request;

class MensajeriaApiController extends Controller
{
    /**
     * Get inbox for the current user.
     */
    public function recibidos(Request $request)
    {
        $mensajes = MensajePrivado::bandejaEntrada($request->user()->id)
            ->with(['remitente.perfil'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($mensajes);
    }

    /**
     * Get sent messages.
     */
    public function enviados(Request $request)
    {
        $mensajes = MensajePrivado::enviados($request->user()->id)
            ->with(['destinatario.perfil'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($mensajes);
    }

    /**
     * Send a new message.
     */
    public function enviar(Request $request)
    {
        $validated = $request->validate([
            'destinatario_id' => 'required|exists:users,id',
            'asunto' => 'required|string|max:255',
            'cuerpo' => 'required|string',
        ]);

        $mensaje = MensajePrivado::create([
            'remitente_id' => $request->user()->id,
            'destinatario_id' => $validated['destinatario_id'],
            'asunto' => $validated['asunto'],
            'cuerpo' => $validated['cuerpo'],
            'leido_remitente' => true,
            'leido_destinatario' => false,
        ]);

        return response()->json($mensaje);
    }

    /**
     * Detail and mark as read.
     */
    public function ver(Request $request, int $id)
    {
        $mensaje = MensajePrivado::where(function($q) use ($request) {
                $q->where('destinatario_id', $request->user()->id)
                  ->orWhere('remitente_id', $request->user()->id);
            })
            ->with(['remitente.perfil', 'destinatario.perfil', 'respuestas.autor.perfil'])
            ->findOrFail($id);

        // Marcar como leído según quién lo está viendo
        if ($mensaje->destinatario_id == $request->user()->id && !$mensaje->leido_destinatario) {
            $mensaje->update([
                'leido_destinatario' => true,
                'leido_en' => now(),
            ]);
        }

        return response()->json($mensaje);
    }

    /**
     * Reply to a message.
     */
    public function responder(Request $request, int $id)
    {
        $validated = $request->validate([
            'respuesta' => 'required|string',
        ]);

        $reply = MensajePrivadoRespuesta::create([
            'mensaje_privado_id' => $id,
            'user_id' => $request->user()->id,
            'respuesta' => $validated['respuesta'],
        ]);

        return response()->json($reply->load('autor.perfil'));
    }

    /**
     * Search users to send message.
     */
    public function buscarContactos(Request $request)
    {
        $query = $request->get('q');
        $users = User::whereHas('perfil', function($q) use ($query) {
            $q->where('primer_nombre', 'like', "%$query%")
              ->orWhere('apellido_paterno', 'like', "%$query%");
        })
        ->with('perfil')
        ->limit(10)
        ->get();

        return response()->json($users);
    }
}
