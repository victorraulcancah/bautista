# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Bautista La Pascana** — Educational Management System built with Laravel 13 + React 19 (Inertia.js SPA). Manages students, teachers, courses, grades, sections, and educational levels.

## Commands

```bash
# Development
composer run dev          # Start PHP server + queue + Vite dev server (all at once)
composer run dev:ssr      # Development with SSR enabled
npm run dev               # Vite dev server only

# Setup (first time)
composer run setup        # composer install + migrate + npm install + build

# Building
npm run build             # Production frontend build
npm run build:ssr         # SSR build

# Testing
composer run test         # Run lint + Pest tests
vendor/bin/pest           # Run all tests
vendor/bin/pest tests/Feature/Auth/AuthenticationTest.php  # Run single test file
vendor/bin/pest --filter="test name"  # Run tests matching a name

# Code quality
composer run lint         # Fix PHP code style with Pint
composer run lint:check   # Check PHP code style (no changes)
npm run lint              # ESLint frontend
npm run format            # Prettier format

# CI check (run before pushing)
composer run ci:check     # Full lint + type check + tests
```

## Architecture

### Backend (Laravel 13, PHP 8.3+)

**Three-layer architecture** — Controllers delegate to Services, Services use Repositories:
- `app/Http/Controllers/Api/` — Thin API controllers (only handle HTTP, delegate to services)
- `app/Services/` — Business logic. Each resource has an interface + implementation (e.g., `EstudianteServiceInterface` + `EstudianteService`)
- `app/Repositories/` — Data access layer. Each resource has an interface + implementation (e.g., `EstudianteRepositoryInterface` + `EstudianteRepository`)
- `app/Models/` — Eloquent models (Estudiante, Docente, Curso, Grado, NivelEducativo, Seccion, PadreApoderado, Perfil, LoginHistory, InstitucionEducativa)

When adding a new resource, follow this pattern: create Model → Migration → Repository interface + impl → Service interface + impl → Controller → Routes → Form Requests.

**Authentication:**
- Web routes: custom `AuthenticateWithToken` middleware (not standard Laravel auth)
- API routes: Laravel Sanctum (`auth:sanctum` middleware)
- Fortify handles registration, password reset, 2FA
- Spatie Permission handles roles/permissions (seeded via `RolePermissionSeeder`)

**Routes:**
- `routes/web.php` — Inertia page routes (returns React views)
- `routes/api.php` — JSON API endpoints (Sanctum-protected)
- `routes/settings.php` — Profile/security settings

### Frontend (React 19 + TypeScript + Inertia.js)

**Pages** live in `resources/js/pages/` and are mapped 1:1 to Inertia routes. Each resource page follows this structure:
```
pages/Estudiantes/
├── index.tsx              # Main page (list/table)
└── components/
    └── EstudianteFormModal.tsx  # Create/edit modal
```

**Custom hooks** in `resources/js/hooks/` define table columns per resource (e.g., `useEstudiantesColumns.tsx`).

**API services** in `resources/js/services/` wrap axios calls per resource.

**Wayfinder** auto-generates type-safe route helpers in `resources/js/actions/` and `resources/js/routes/` — do not edit these files manually. Regenerate with `npm run build`.

**UI:** shadcn/ui (new-york style) + Radix UI primitives + Tailwind CSS 4 + Lucide icons. Component aliases: `@/components`, `@/hooks`, `@/lib`, `@/pages`, etc. (see `tsconfig.json`).

### Database

Development uses **MySQL** (`edu_bautista2`) as configured in `.env`. Tests use in-memory SQLite (configured in `phpunit.xml` — no extra setup needed).

Sessions, cache, and queues all use the database driver by default.

## Testing

Tests use **Pest v4** with an in-memory SQLite database (set in `phpunit.xml` — no setup needed).

```bash
vendor/bin/pest                          # All tests
vendor/bin/pest --group=feature          # Feature tests only
vendor/bin/pest tests/Feature/Auth/      # Specific directory
```

## Code Style

- **PHP**: Laravel Pint (Laravel preset). Run `composer run lint` to auto-fix.
- **TypeScript/React**: ESLint + Prettier. Run `npm run format && npm run lint`.
- **Strict TypeScript**: `strict: true` in tsconfig. Avoid `any`.

## CI/CD

GitHub Actions runs on push/PR to `develop`, `main`, `master`:
- **tests.yml**: Tests against PHP 8.3, 8.4, 8.5 matrix
- **lint.yml**: PHP Pint + ESLint + Prettier checks
