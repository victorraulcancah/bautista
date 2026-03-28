<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InstitucionNoticia;
use App\Models\InstitucionBlog;
use Illuminate\Http\Request;
use Throwable;

class BlogApiController extends Controller
{
    /**
     * Get all news and blog posts.
     */
    public function index(Request $request)
    {
        try {
            $noticias = InstitucionNoticia::where('not_estatus', 1)
                ->orderBy('not_fecha', 'desc')
                ->limit(10)
                ->get();
        } catch (Throwable $e) {
            $noticias = collect();
        }

        try {
            $posts = InstitucionBlog::where('blo_estatus', 1)
                ->with('autor.perfil')
                ->orderBy('blo_fecha', 'desc')
                ->limit(10)
                ->get();
        } catch (Throwable $e) {
            $posts = collect();
        }

        return response()->json([
            'noticias' => $noticias,
            'posts'    => $posts,
        ]);
    }

    /**
     * Get single blog post.
     */
    public function show(Request $request, int $id)
    {
        try {
            $post = InstitucionBlog::with('autor.perfil')->findOrFail($id);
            return response()->json($post);
        } catch (Throwable $e) {
            return response()->json(['message' => 'Post no encontrado.'], 404);
        }
    }
}

