<?php

namespace App\Providers;

use App\Repositories\Implements\AsistenciaRepository;
use App\Repositories\Implements\CursoRepository;
use App\Repositories\Implements\CursoContenidoRepository;
use App\Repositories\Implements\MatriculaRepository;
use App\Repositories\Implements\DocenteRepository;
use App\Repositories\Implements\EstudianteRepository;
use App\Repositories\Implements\GradoRepository;
use App\Repositories\Implements\NivelEducativoRepository;
use App\Repositories\Implements\SeccionRepository;
use App\Repositories\Interfaces\AsistenciaRepositoryInterface;
use App\Repositories\Interfaces\CursoRepositoryInterface;
use App\Repositories\Interfaces\CursoContenidoRepositoryInterface;
use App\Repositories\Interfaces\MatriculaRepositoryInterface;
use App\Repositories\Interfaces\DocenteRepositoryInterface;
use App\Repositories\Interfaces\EstudianteRepositoryInterface;
use App\Repositories\Interfaces\GradoRepositoryInterface;
use App\Repositories\Interfaces\NivelEducativoRepositoryInterface;
use App\Repositories\Interfaces\SeccionRepositoryInterface;
use App\Services\Implements\AsistenciaService;
use App\Services\Implements\AuthService;
use App\Services\Implements\CursoContenidoService;
use App\Services\Implements\MatriculaService;
use App\Services\Implements\CursoService;
use App\Services\Implements\DocenteService;
use App\Services\Implements\EstudianteService;
use App\Services\Implements\GradoService;
use App\Services\Implements\NivelEducativoService;
use App\Services\Implements\SeccionService;
use App\Services\Interfaces\AsistenciaServiceInterface;
use App\Services\Interfaces\AuthServiceInterface;
use App\Services\Interfaces\CursoContenidoServiceInterface;
use App\Services\Interfaces\MatriculaServiceInterface;
use App\Services\Interfaces\CursoServiceInterface;
use App\Services\Interfaces\DocenteServiceInterface;
use App\Services\Interfaces\EstudianteServiceInterface;
use App\Services\Interfaces\GradoServiceInterface;
use App\Services\Interfaces\NivelEducativoServiceInterface;
use App\Services\Interfaces\SeccionServiceInterface;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Auth
        $this->app->bind(AuthServiceInterface::class, AuthService::class);

        // Estudiante
        $this->app->bind(EstudianteRepositoryInterface::class, EstudianteRepository::class);
        $this->app->bind(EstudianteServiceInterface::class, EstudianteService::class);

        // NivelEducativo
        $this->app->bind(NivelEducativoRepositoryInterface::class, NivelEducativoRepository::class);
        $this->app->bind(NivelEducativoServiceInterface::class, NivelEducativoService::class);

        // Grado
        $this->app->bind(GradoRepositoryInterface::class, GradoRepository::class);
        $this->app->bind(GradoServiceInterface::class, GradoService::class);

        // Seccion
        $this->app->bind(SeccionRepositoryInterface::class, SeccionRepository::class);
        $this->app->bind(SeccionServiceInterface::class, SeccionService::class);

        // Curso
        $this->app->bind(CursoRepositoryInterface::class, CursoRepository::class);
        $this->app->bind(CursoServiceInterface::class, CursoService::class);

        // Docente
        $this->app->bind(DocenteRepositoryInterface::class, DocenteRepository::class);
        $this->app->bind(DocenteServiceInterface::class, DocenteService::class);

        // Matricula
        $this->app->bind(MatriculaRepositoryInterface::class, MatriculaRepository::class);
        $this->app->bind(MatriculaServiceInterface::class, MatriculaService::class);

        // CursoContenido (Unidades y Clases)
        $this->app->bind(CursoContenidoRepositoryInterface::class, CursoContenidoRepository::class);
        $this->app->bind(CursoContenidoServiceInterface::class, CursoContenidoService::class);

        // Asistencia
        $this->app->bind(AsistenciaRepositoryInterface::class, AsistenciaRepository::class);
        $this->app->bind(AsistenciaServiceInterface::class, AsistenciaService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
