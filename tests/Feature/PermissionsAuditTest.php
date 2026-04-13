<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;

/**
 * Test de Auditoría de Permisos
 * 
 * Este test NO hace cambios, solo analiza y reporta:
 * - Rutas sin protección de permisos
 * - Vistas sin verificación de permisos
 * - Componentes sin control de acceso
 * - Endpoints API sin middleware de permisos
 */
class PermissionsAuditTest extends TestCase
{
    protected array $report = [];
    protected array $issues = [];
    protected array $stats = [];

    /**
     * Test principal: Auditoría completa del sistema de permisos
     */
    public function test_audit_permissions_system(): void
    {
        echo "\n\n";
        echo "╔══════════════════════════════════════════════════════════════╗\n";
        echo "║         AUDITORÍA DE PERMISOS - SISTEMA BAUTISTA            ║\n";
        echo "╚══════════════════════════════════════════════════════════════╝\n\n";

        // 1. Auditar rutas web
        $this->auditWebRoutes();

        // 2. Auditar rutas API
        $this->auditApiRoutes();

        // 3. Auditar vistas React/Inertia
        $this->auditReactViews();

        // 4. Auditar componentes
        $this->auditReactComponents();

        // 5. Generar reporte final
        $this->generateFinalReport();

        // El test siempre pasa, solo reporta
        $this->assertTrue(true, 'Auditoría completada');
    }

    /**
     * Auditar rutas web
     */
    protected function auditWebRoutes(): void
    {
        echo "📋 AUDITANDO RUTAS WEB...\n";
        echo str_repeat("─", 60) . "\n";

        $routes = Route::getRoutes();
        $webRoutes = [];
        $protectedRoutes = [];
        $unprotectedRoutes = [];

        foreach ($routes as $route) {
            if (str_starts_with($route->uri(), 'api/')) {
                continue; // Skip API routes
            }

            $middleware = $route->middleware();
            $hasAuth = in_array('auth', $middleware) || in_array('auth:sanctum', $middleware);
            $hasPermission = $this->hasPermissionMiddleware($middleware);
            $hasRole = $this->hasRoleMiddleware($middleware);

            $routeInfo = [
                'uri' => $route->uri(),
                'name' => $route->getName(),
                'method' => implode('|', $route->methods()),
                'middleware' => $middleware,
                'has_auth' => $hasAuth,
                'has_permission' => $hasPermission,
                'has_role' => $hasRole,
                'protected' => $hasAuth && ($hasPermission || $hasRole),
            ];

            $webRoutes[] = $routeInfo;

            if ($routeInfo['protected']) {
                $protectedRoutes[] = $routeInfo;
            } elseif ($hasAuth) {
                $unprotectedRoutes[] = $routeInfo;
            }
        }

        // Reportar rutas sin protección de permisos
        echo "\n🔴 RUTAS AUTENTICADAS SIN PERMISOS:\n";
        if (empty($unprotectedRoutes)) {
            echo "   ✅ Todas las rutas autenticadas tienen permisos\n";
        } else {
            foreach ($unprotectedRoutes as $route) {
                echo "   ⚠️  {$route['method']} /{$route['uri']}\n";
                echo "       Middleware: " . implode(', ', $route['middleware']) . "\n";
                $this->issues[] = [
                    'type' => 'ruta_sin_permisos',
                    'severity' => 'medium',
                    'route' => $route['uri'],
                    'message' => 'Ruta autenticada sin verificación de permisos'
                ];
            }
        }

        $this->stats['total_web_routes'] = count($webRoutes);
        $this->stats['protected_web_routes'] = count($protectedRoutes);
        $this->stats['unprotected_web_routes'] = count($unprotectedRoutes);

        echo "\n📊 Estadísticas Rutas Web:\n";
        echo "   Total: " . count($webRoutes) . "\n";
        echo "   Protegidas: " . count($protectedRoutes) . "\n";
        echo "   Sin permisos: " . count($unprotectedRoutes) . "\n\n";
    }

    /**
     * Auditar rutas API
     */
    protected function auditApiRoutes(): void
    {
        echo "📋 AUDITANDO RUTAS API...\n";
        echo str_repeat("─", 60) . "\n";

        $routes = Route::getRoutes();
        $apiRoutes = [];
        $protectedApiRoutes = [];
        $unprotectedApiRoutes = [];

        foreach ($routes as $route) {
            if (!str_starts_with($route->uri(), 'api/')) {
                continue;
            }

            $middleware = $route->middleware();
            $hasAuth = in_array('auth', $middleware) || in_array('auth:sanctum', $middleware);
            $hasPermission = $this->hasPermissionMiddleware($middleware);
            $hasRole = $this->hasRoleMiddleware($middleware);

            $routeInfo = [
                'uri' => $route->uri(),
                'name' => $route->getName(),
                'method' => implode('|', $route->methods()),
                'middleware' => $middleware,
                'has_auth' => $hasAuth,
                'has_permission' => $hasPermission,
                'has_role' => $hasRole,
                'protected' => $hasAuth && ($hasPermission || $hasRole),
            ];

            $apiRoutes[] = $routeInfo;

            if ($routeInfo['protected']) {
                $protectedApiRoutes[] = $routeInfo;
            } elseif ($hasAuth) {
                $unprotectedApiRoutes[] = $routeInfo;
            }
        }

        // Reportar APIs sin protección
        echo "\n🔴 ENDPOINTS API SIN PERMISOS:\n";
        if (empty($unprotectedApiRoutes)) {
            echo "   ✅ Todos los endpoints tienen permisos\n";
        } else {
            foreach ($unprotectedApiRoutes as $route) {
                echo "   ⚠️  {$route['method']} /{$route['uri']}\n";
                $this->issues[] = [
                    'type' => 'api_sin_permisos',
                    'severity' => 'high',
                    'route' => $route['uri'],
                    'message' => 'Endpoint API sin verificación de permisos'
                ];
            }
        }

        $this->stats['total_api_routes'] = count($apiRoutes);
        $this->stats['protected_api_routes'] = count($protectedApiRoutes);
        $this->stats['unprotected_api_routes'] = count($unprotectedApiRoutes);

        echo "\n📊 Estadísticas Rutas API:\n";
        echo "   Total: " . count($apiRoutes) . "\n";
        echo "   Protegidas: " . count($protectedApiRoutes) . "\n";
        echo "   Sin permisos: " . count($unprotectedApiRoutes) . "\n\n";
    }

    /**
     * Auditar vistas React/Inertia
     */
    protected function auditReactViews(): void
    {
        echo "📋 AUDITANDO VISTAS REACT...\n";
        echo str_repeat("─", 60) . "\n";

        $pagesPath = resource_path('js/pages');
        $views = $this->scanDirectory($pagesPath, '.tsx');

        $viewsWithPermissions = [];
        $viewsWithoutPermissions = [];

        foreach ($views as $view) {
            $content = File::get($view);
            $hasCanComponent = str_contains($content, '<Can ') || str_contains($content, '<Can>');
            $hasUsePermissions = str_contains($content, 'usePermissions');
            $hasPermissionCheck = str_contains($content, 'can(') || str_contains($content, 'hasRole(');

            $viewInfo = [
                'path' => str_replace(resource_path('js/pages/'), '', $view),
                'has_can_component' => $hasCanComponent,
                'has_use_permissions' => $hasUsePermissions,
                'has_permission_check' => $hasPermissionCheck,
                'has_any_protection' => $hasCanComponent || $hasUsePermissions || $hasPermissionCheck,
            ];

            if ($viewInfo['has_any_protection']) {
                $viewsWithPermissions[] = $viewInfo;
            } else {
                $viewsWithoutPermissions[] = $viewInfo;
            }
        }

        // Reportar vistas sin verificación de permisos
        echo "\n🔴 VISTAS SIN VERIFICACIÓN DE PERMISOS:\n";
        if (empty($viewsWithoutPermissions)) {
            echo "   ✅ Todas las vistas verifican permisos\n";
        } else {
            foreach ($viewsWithoutPermissions as $view) {
                echo "   ⚠️  {$view['path']}\n";
                $this->issues[] = [
                    'type' => 'vista_sin_permisos',
                    'severity' => 'medium',
                    'file' => $view['path'],
                    'message' => 'Vista sin verificación de permisos'
                ];
            }
        }

        $this->stats['total_views'] = count($views);
        $this->stats['views_with_permissions'] = count($viewsWithPermissions);
        $this->stats['views_without_permissions'] = count($viewsWithoutPermissions);

        echo "\n📊 Estadísticas Vistas:\n";
        echo "   Total: " . count($views) . "\n";
        echo "   Con permisos: " . count($viewsWithPermissions) . "\n";
        echo "   Sin permisos: " . count($viewsWithoutPermissions) . "\n\n";
    }

    /**
     * Auditar componentes React
     */
    protected function auditReactComponents(): void
    {
        echo "📋 AUDITANDO COMPONENTES REACT...\n";
        echo str_repeat("─", 60) . "\n";

        $componentsPath = resource_path('js/components');
        $components = $this->scanDirectory($componentsPath, '.tsx');

        $componentsWithPermissions = [];
        $componentsWithoutPermissions = [];

        foreach ($components as $component) {
            $content = File::get($component);
            $hasCanComponent = str_contains($content, '<Can ') || str_contains($content, '<Can>');
            $hasUsePermissions = str_contains($content, 'usePermissions');
            $hasPermissionCheck = str_contains($content, 'can(') || str_contains($content, 'hasRole(');

            // Solo reportar componentes que probablemente necesiten permisos
            $needsPermissions = str_contains($content, 'Button') || 
                               str_contains($content, 'Link') ||
                               str_contains($content, 'onClick') ||
                               str_contains($content, 'onSubmit');

            if (!$needsPermissions) {
                continue; // Skip componentes simples
            }

            $componentInfo = [
                'path' => str_replace(resource_path('js/components/'), '', $component),
                'has_can_component' => $hasCanComponent,
                'has_use_permissions' => $hasUsePermissions,
                'has_permission_check' => $hasPermissionCheck,
                'has_any_protection' => $hasCanComponent || $hasUsePermissions || $hasPermissionCheck,
            ];

            if ($componentInfo['has_any_protection']) {
                $componentsWithPermissions[] = $componentInfo;
            } else {
                $componentsWithoutPermissions[] = $componentInfo;
            }
        }

        // Reportar componentes sin verificación
        echo "\n🔴 COMPONENTES INTERACTIVOS SIN PERMISOS:\n";
        if (empty($componentsWithoutPermissions)) {
            echo "   ✅ Todos los componentes verifican permisos\n";
        } else {
            foreach ($componentsWithoutPermissions as $component) {
                echo "   ⚠️  {$component['path']}\n";
                $this->issues[] = [
                    'type' => 'componente_sin_permisos',
                    'severity' => 'low',
                    'file' => $component['path'],
                    'message' => 'Componente interactivo sin verificación de permisos'
                ];
            }
        }

        $this->stats['total_components'] = count($components);
        $this->stats['components_with_permissions'] = count($componentsWithPermissions);
        $this->stats['components_without_permissions'] = count($componentsWithoutPermissions);

        echo "\n📊 Estadísticas Componentes:\n";
        echo "   Total analizados: " . count($components) . "\n";
        echo "   Con permisos: " . count($componentsWithPermissions) . "\n";
        echo "   Sin permisos: " . count($componentsWithoutPermissions) . "\n\n";
    }

    /**
     * Generar reporte final
     */
    protected function generateFinalReport(): void
    {
        echo "\n\n";
        echo "╔══════════════════════════════════════════════════════════════╗\n";
        echo "║                    REPORTE FINAL                             ║\n";
        echo "╚══════════════════════════════════════════════════════════════╝\n\n";

        // Resumen de problemas por severidad
        $critical = array_filter($this->issues, fn($i) => $i['severity'] === 'critical');
        $high = array_filter($this->issues, fn($i) => $i['severity'] === 'high');
        $medium = array_filter($this->issues, fn($i) => $i['severity'] === 'medium');
        $low = array_filter($this->issues, fn($i) => $i['severity'] === 'low');

        echo "🚨 PROBLEMAS ENCONTRADOS:\n";
        echo "   Críticos: " . count($critical) . "\n";
        echo "   Altos: " . count($high) . "\n";
        echo "   Medios: " . count($medium) . "\n";
        echo "   Bajos: " . count($low) . "\n";
        echo "   TOTAL: " . count($this->issues) . "\n\n";

        // Estadísticas generales
        echo "📊 ESTADÍSTICAS GENERALES:\n";
        echo "   Rutas Web: {$this->stats['total_web_routes']} ({$this->stats['protected_web_routes']} protegidas)\n";
        echo "   Rutas API: {$this->stats['total_api_routes']} ({$this->stats['protected_api_routes']} protegidas)\n";
        echo "   Vistas: {$this->stats['total_views']} ({$this->stats['views_with_permissions']} con permisos)\n";
        echo "   Componentes: {$this->stats['total_components']} ({$this->stats['components_with_permissions']} con permisos)\n\n";

        // Calcular porcentaje de cobertura
        $totalItems = $this->stats['total_web_routes'] + 
                     $this->stats['total_api_routes'] + 
                     $this->stats['total_views'];
        
        $protectedItems = $this->stats['protected_web_routes'] + 
                         $this->stats['protected_api_routes'] + 
                         $this->stats['views_with_permissions'];

        $coverage = $totalItems > 0 ? round(($protectedItems / $totalItems) * 100, 2) : 0;

        echo "📈 COBERTURA DE PERMISOS: {$coverage}%\n\n";

        // Recomendaciones
        echo "💡 RECOMENDACIONES:\n";
        if ($coverage < 50) {
            echo "   🔴 CRÍTICO: Menos del 50% del sistema tiene permisos\n";
            echo "   → Priorizar implementación de sistema de permisos\n";
        } elseif ($coverage < 80) {
            echo "   🟡 ADVERTENCIA: Cobertura de permisos insuficiente\n";
            echo "   → Revisar rutas y vistas sin protección\n";
        } else {
            echo "   🟢 BUENO: Cobertura de permisos aceptable\n";
            echo "   → Continuar mejorando la cobertura\n";
        }

        if ($this->stats['unprotected_api_routes'] > 0) {
            echo "   ⚠️  Hay {$this->stats['unprotected_api_routes']} endpoints API sin permisos\n";
            echo "   → Agregar middleware de permisos a las rutas API\n";
        }

        if ($this->stats['views_without_permissions'] > 0) {
            echo "   ⚠️  Hay {$this->stats['views_without_permissions']} vistas sin verificación\n";
            echo "   → Implementar componente <Can> o usePermissions hook\n";
        }

        echo "\n";
        echo "╔══════════════════════════════════════════════════════════════╗\n";
        echo "║              AUDITORÍA COMPLETADA                            ║\n";
        echo "╚══════════════════════════════════════════════════════════════╝\n\n";

        // Guardar reporte en archivo
        $this->saveReportToFile();
    }

    /**
     * Guardar reporte en archivo
     */
    protected function saveReportToFile(): void
    {
        $reportPath = storage_path('logs/permissions_audit_' . date('Y-m-d_H-i-s') . '.json');
        
        $report = [
            'timestamp' => now()->toIso8601String(),
            'stats' => $this->stats,
            'issues' => $this->issues,
            'coverage' => $this->stats['total_web_routes'] + $this->stats['total_api_routes'] + $this->stats['total_views'] > 0
                ? round((($this->stats['protected_web_routes'] + $this->stats['protected_api_routes'] + $this->stats['views_with_permissions']) / 
                         ($this->stats['total_web_routes'] + $this->stats['total_api_routes'] + $this->stats['total_views'])) * 100, 2)
                : 0,
        ];

        File::put($reportPath, json_encode($report, JSON_PRETTY_PRINT));
        
        echo "📄 Reporte guardado en: {$reportPath}\n\n";
    }

    /**
     * Helpers
     */
    protected function hasPermissionMiddleware(array $middleware): bool
    {
        foreach ($middleware as $m) {
            if (str_contains($m, 'permission:') || str_contains($m, 'can:')) {
                return true;
            }
        }
        return false;
    }

    protected function hasRoleMiddleware(array $middleware): bool
    {
        foreach ($middleware as $m) {
            if (str_contains($m, 'role:') || str_contains($m, 'check.role:')) {
                return true;
            }
        }
        return false;
    }

    protected function scanDirectory(string $path, string $extension): array
    {
        if (!File::exists($path)) {
            return [];
        }

        $files = [];
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($path)
        );

        foreach ($iterator as $file) {
            if ($file->isFile() && str_ends_with($file->getFilename(), $extension)) {
                $files[] = $file->getPathname();
            }
        }

        return $files;
    }
}
