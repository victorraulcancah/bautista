# Skill: Migración de Código

## Objetivo
Migrar la lógica de negocio del proyecto antiguo al nuevo proyecto con estructura SOLID.

## Estructura de Mapeo

### Autenticación
**Origen**: `bautistalapascana/auth/`
**Destino**: `bautista/app/Services/AuthService.php`
**Pasos**:
1. Analizar lógica de login/logout
2. Crear AuthService con métodos reutilizables
3. Integrar con Laravel Fortify
4. Migrar validaciones

### Funcionalidades
**Origen**: `bautistalapascana/funcionalidades/`
**Destino**: `bautista/app/Services/`
**Pasos**:
1. Identificar cada funcionalidad
2. Crear un Service por funcionalidad
3. Implementar Interfaces para contratos
4. Usar Repositories para acceso a datos

### Utilidades
**Origen**: `bautistalapascana/utils/`
**Destino**: `bautista/app/Traits/` o `bautista/app/Services/`
**Pasos**:
1. Convertir funciones a Traits reutilizables
2. O crear Services para lógica compleja

### Módulos
**Origen**: `bautistalapascana/modulos/`
**Destino**: `bautista/app/Http/Controllers/`
**Pasos**:
1. Crear Controllers por módulo
2. Usar Services para lógica
3. Retornar respuestas JSON para API

## Estructura SOLID a Implementar

```
bautista/app/
├── Services/          # Lógica de negocio
├── Repositories/      # Acceso a datos
├── Interfaces/        # Contratos
├── Traits/           # Comportamientos reutilizables
├── Exceptions/       # Excepciones personalizadas
├── Http/
│   ├── Controllers/  # Controladores
│   └── Requests/     # Validaciones
└── Models/           # Eloquent Models
```

## Checklist
- [ ] Analizar cada módulo
- [ ] Crear Services correspondientes
- [ ] Crear Repositories
- [ ] Implementar Interfaces
- [ ] Crear Controllers
- [ ] Validar funcionamiento
