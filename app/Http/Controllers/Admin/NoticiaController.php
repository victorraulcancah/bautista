<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InstitucionNoticia;
use App\Models\NoticiaComentario;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Http\Resources\NoticiaResource;

class NoticiaController extends Controller
{
    /**
     * Vista de la Portada del Periódico
     */
    public function portada(): Response
    {
        $noticias = InstitucionNoticia::where('not_estatus', 1)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Institucion/Noticias/NoticiasDiario', [
            'noticias' => NoticiaResource::collection($noticias)->resolve()
        ]);
    }

    /**
     * Vista Detallada de una Crónica
     */
    public function showDiario(int $id): Response
    {
        $noticia = InstitucionNoticia::with(['comentarios.user' => function($q) {
            $q->orderBy('created_at', 'desc');
        }])->findOrFail($id);

        $recientes = InstitucionNoticia::where('not_estatus', 1)
            ->where('not_id', '!=', $id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Institucion/Noticias/NoticiaDetalle', [
            'noticia'   => (new NoticiaResource($noticia))->resolve(),
            'recientes' => NoticiaResource::collection($recientes)->resolve()
        ]);
    }

    /**
     * Almacena un comentario en una noticia
     */
    public function storeComentario(Request $request, int $id)
    {
        $request->validate([
            'contenido' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:noticia_comentarios,id'
        ]);

        NoticiaComentario::create([
            'noticia_id' => $id,
            'user_id'    => auth()->id(),
            'parent_id'  => $request->parent_id,
            'contenido'  => $request->contenido,
        ]);

        return back()->with('success', 'Comentario publicado');
    }
}
