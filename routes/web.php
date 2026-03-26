<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => redirect()->route('login'))->name('home');

// ── Rutas públicas ──────────────────────────────────────────────────────
Route::get('/login', fn () => Inertia::render('auth/login'))->name('login');

// ── Rutas protegidas ────────────────────────────────────────────────────
Route::middleware(['auth.token'])->group(function () {
    Route::get('/dashboard',    fn () => Inertia::render('Dashboard/index'))->name('dashboard');
    Route::get('/estudiantes',  fn () => Inertia::render('Estudiantes/index'))->name('estudiantes.index');
    Route::get('/docentes',     fn () => Inertia::render('Docentes/index'))->name('docentes.index');
    Route::get('/niveles',      fn () => Inertia::render('Niveles/index'))->name('niveles.index');
    Route::get('/grados',       fn () => Inertia::render('Grados/index'))->name('grados.index');
    Route::get('/secciones',    fn () => Inertia::render('Secciones/index'))->name('secciones.index');
    Route::get('/cursos',       fn () => Inertia::render('Cursos/index'))->name('cursos.index');
    Route::get('/matriculas',             fn () => Inertia::render('Matricula/index'))->name('matriculas.index');
    Route::get('/cursos/{id}/contenido',  fn (int $id) => Inertia::render('CursoContenido/index', ['cursoId' => $id]))->name('cursos.contenido');
});

require __DIR__.'/settings.php';
