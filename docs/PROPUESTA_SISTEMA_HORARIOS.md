# Propuesta: Sistema de Horarios Estructurado

## 🎯 Objetivo

Crear un sistema que permita:
- Asignar clases por día, hora, curso y docente a cada sección
- Visualizar horarios de forma clara (tabla semanal)
- Detectar conflictos automáticamente
- Generar reportes de carga horaria
- Mantener orden entre secciones (1°A, 1°B, Única, etc.)

---

## 📊 Diseño de Base de Datos

### Tabla Principal: `horario_clases`

```sql
CREATE TABLE horario_clases (
    horario_clase_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Relaciones
    seccion_id BIGINT NOT NULL,              -- FK a secciones (1°A, 1°B, etc.)
    curso_id BIGINT NOT NULL,                -- FK a cursos (Matemática, etc.)
    docente_id BIGINT NOT NULL,              -- FK a docentes
    
    -- Tiempo
    dia_semana TINYINT NOT NULL,             -- 1=Lunes, 2=Martes, ..., 7=Domingo
    hora_inicio TIME NOT NULL,               -- Ej: 08:00:00
    hora_fin TIME NOT NULL,                  -- Ej: 09:00:00
    
    -- Ubicación (opcional)
    aula VARCHAR(50) NULL,                   -- Ej: "Aula 201", "Lab. Cómputo"
    
    -- Periodo académico
    anio_escolar INT NOT NULL,               -- Ej: 2026
    periodo CHAR(1) DEFAULT 'A',             -- 'A'=Anual, '1'=Bimestre1, etc.
    
    -- Estado
    activo BOOLEAN DEFAULT TRUE,
    
    -- Auditoría
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    -- Índices
    INDEX idx_seccion_dia (seccion_id, dia_semana),
    INDEX idx_docente_dia (docente_id, dia_semana),
    INDEX idx_anio_periodo (anio_escolar, periodo),
    
    -- Foreign Keys
    FOREIGN KEY (seccion_id) REFERENCES secciones(seccion_id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES cursos(curso_id) ON DELETE CASCADE,
    FOREIGN KEY (docente_id) REFERENCES docentes(docente_id) ON DELETE CASCADE
);
```

### Tabla de Configuración: `horario_bloques`

Para definir los bloques horarios estándar del colegio:

```sql
CREATE TABLE horario_bloques (
    bloque_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    insti_id BIGINT NOT NULL,
    
    nombre VARCHAR(100) NOT NULL,            -- Ej: "1ra Hora", "Recreo", "2da Hora"
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    orden TINYINT NOT NULL,                  -- Para ordenar en la UI
    es_recreo BOOLEAN DEFAULT FALSE,         -- Marcar recreos
    
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (insti_id) REFERENCES institucion_educativa(insti_id) ON DELETE CASCADE
);
```

---

## 🏗️ Estructura del Sistema

### 1. Modelos Laravel

#### `app/Models/HorarioClase.php`
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HorarioClase extends Model
{
    protected $table = 'horario_clases';
    protected $primaryKey = 'horario_clase_id';

    protected $fillable = [
        'seccion_id', 'curso_id', 'docente_id',
        'dia_semana', 'hora_inicio', 'hora_fin',
        'aula', 'anio_escolar', 'periodo', 'activo'
    ];

    protected $casts = [
        'activo' => 'boolean',
        'dia_semana' => 'integer',
        'anio_escolar' => 'integer',
    ];

    // Relaciones
    public function seccion(): BelongsTo
    {
        return $this->belongsTo(Seccion::class, 'seccion_id', 'seccion_id');
    }

    public function curso(): BelongsTo
    {
        return $this->belongsTo(Curso::class, 'curso_id', 'curso_id');
    }

    public function docente(): BelongsTo
    {
        return $this->belongsTo(Docente::class, 'docente_id', 'docente_id');
    }

    // Scopes
    public function scopeActivo($query)
    {
        return $query->where('activo', true);
    }

    public function scopePorSeccion($query, $seccionId)
    {
        return $query->where('seccion_id', $seccionId);
    }

    public function scopePorDocente($query, $docenteId)
    {
        return $query->where('docente_id', $docenteId);
    }

    public function scopePorDia($query, $dia)
    {
        return $query->where('dia_semana', $dia);
    }

    public function scopeAnioActual($query)
    {
        return $query->where('anio_escolar', date('Y'));
    }

    // Helpers
    public function getNombreDiaAttribute(): string
    {
        $dias = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        return $dias[$this->dia_semana] ?? '';
    }

    public function getDuracionMinutosAttribute(): int
    {
        $inicio = strtotime($this->hora_inicio);
        $fin = strtotime($this->hora_fin);
        return ($fin - $inicio) / 60;
    }
}
```

#### `app/Models/HorarioBloque.php`
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HorarioBloque extends Model
{
    protected $table = 'horario_bloques';
    protected $primaryKey = 'bloque_id';

    protected $fillable = [
        'insti_id', 'nombre', 'hora_inicio', 'hora_fin', 
        'orden', 'es_recreo'
    ];

    protected $casts = [
        'es_recreo' => 'boolean',
        'orden' => 'integer',
    ];

    public function scopeOrdenado($query)
    {
        return $query->orderBy('orden');
    }
}
```

---

## 🔧 Servicios y Lógica de Negocio

### `app/Services/HorarioService.php`

```php
<?php

namespace App\Services;

use App\Models\HorarioClase;
use Carbon\Carbon;

class HorarioService
{
    /**
     * Obtener horario semanal de una sección
     */
    public function obtenerHorarioSeccion(int $seccionId, int $anio = null): array
    {
        $anio = $anio ?? date('Y');
        
        $clases = HorarioClase::with(['curso', 'docente'])
            ->where('seccion_id', $seccionId)
            ->where('anio_escolar', $anio)
            ->activo()
            ->orderBy('dia_semana')
            ->orderBy('hora_inicio')
            ->get();

        return $this->formatearHorarioSemanal($clases);
    }

    /**
     * Obtener horario de un docente
     */
    public function obtenerHorarioDocente(int $docenteId, int $anio = null): array
    {
        $anio = $anio ?? date('Y');
        
        $clases = HorarioClase::with(['curso', 'seccion.grado'])
            ->where('docente_id', $docenteId)
            ->where('anio_escolar', $anio)
            ->activo()
            ->orderBy('dia_semana')
            ->orderBy('hora_inicio')
            ->get();

        return $this->formatearHorarioSemanal($clases);
    }

    /**
     * Detectar conflictos de horario
     */
    public function detectarConflictos(array $datos): array
    {
        $conflictos = [];

        // Conflicto 1: Docente en dos lugares al mismo tiempo
        $conflictoDocente = HorarioClase::where('docente_id', $datos['docente_id'])
            ->where('dia_semana', $datos['dia_semana'])
            ->where('anio_escolar', $datos['anio_escolar'])
            ->where('activo', true)
            ->where(function($q) use ($datos) {
                $q->whereBetween('hora_inicio', [$datos['hora_inicio'], $datos['hora_fin']])
                  ->orWhereBetween('hora_fin', [$datos['hora_inicio'], $datos['hora_fin']])
                  ->orWhere(function($q2) use ($datos) {
                      $q2->where('hora_inicio', '<=', $datos['hora_inicio'])
                         ->where('hora_fin', '>=', $datos['hora_fin']);
                  });
            })
            ->with(['seccion', 'curso'])
            ->first();

        if ($conflictoDocente) {
            $conflictos[] = [
                'tipo' => 'docente',
                'mensaje' => "El docente ya tiene clase de {$conflictoDocente->curso->nombre} en {$conflictoDocente->seccion->nombre} a esta hora"
            ];
        }

        // Conflicto 2: Sección con dos clases al mismo tiempo
        $conflictoSeccion = HorarioClase::where('seccion_id', $datos['seccion_id'])
            ->where('dia_semana', $datos['dia_semana'])
            ->where('anio_escolar', $datos['anio_escolar'])
            ->where('activo', true)
            ->where(function($q) use ($datos) {
                $q->whereBetween('hora_inicio', [$datos['hora_inicio'], $datos['hora_fin']])
                  ->orWhereBetween('hora_fin', [$datos['hora_inicio'], $datos['hora_fin']])
                  ->orWhere(function($q2) use ($datos) {
                      $q2->where('hora_inicio', '<=', $datos['hora_inicio'])
                         ->where('hora_fin', '>=', $datos['hora_fin']);
                  });
            })
            ->with(['curso', 'docente'])
            ->first();

        if ($conflictoSeccion) {
            $conflictos[] = [
                'tipo' => 'seccion',
                'mensaje' => "La sección ya tiene clase de {$conflictoSeccion->curso->nombre} a esta hora"
            ];
        }

        // Conflicto 3: Aula ocupada (si se usa)
        if (!empty($datos['aula'])) {
            $conflictoAula = HorarioClase::where('aula', $datos['aula'])
                ->where('dia_semana', $datos['dia_semana'])
                ->where('anio_escolar', $datos['anio_escolar'])
                ->where('activo', true)
                ->where(function($q) use ($datos) {
                    $q->whereBetween('hora_inicio', [$datos['hora_inicio'], $datos['hora_fin']])
                      ->orWhereBetween('hora_fin', [$datos['hora_inicio'], $datos['hora_fin']])
                      ->orWhere(function($q2) use ($datos) {
                          $q2->where('hora_inicio', '<=', $datos['hora_inicio'])
                             ->where('hora_fin', '>=', $datos['hora_fin']);
                      });
                })
                ->with(['seccion', 'curso'])
                ->first();

            if ($conflictoAula) {
                $conflictos[] = [
                    'tipo' => 'aula',
                    'mensaje' => "El aula ya está ocupada por {$conflictoAula->seccion->nombre} - {$conflictoAula->curso->nombre}"
                ];
            }
        }

        return $conflictos;
    }

    /**
     * Calcular carga horaria de un docente
     */
    public function calcularCargaHoraria(int $docenteId, int $anio = null): array
    {
        $anio = $anio ?? date('Y');
        
        $clases = HorarioClase::where('docente_id', $docenteId)
            ->where('anio_escolar', $anio)
            ->activo()
            ->get();

        $totalMinutos = $clases->sum('duracion_minutos');
        $totalHoras = round($totalMinutos / 60, 2);
        $horasPorSemana = $totalHoras;

        return [
            'total_clases' => $clases->count(),
            'total_horas_semana' => $horasPorSemana,
            'total_minutos_semana' => $totalMinutos,
            'promedio_horas_dia' => round($horasPorSemana / 5, 2),
        ];
    }

    /**
     * Formatear horario en estructura semanal
     */
    private function formatearHorarioSemanal($clases): array
    {
        $horario = [];
        
        foreach ($clases as $clase) {
            $dia = $clase->dia_semana;
            
            if (!isset($horario[$dia])) {
                $horario[$dia] = [
                    'dia' => $clase->nombre_dia,
                    'clases' => []
                ];
            }
            
            $horario[$dia]['clases'][] = [
                'id' => $clase->horario_clase_id,
                'curso' => $clase->curso->nombre,
                'docente' => $clase->docente->nombres . ' ' . $clase->docente->apellidos,
                'hora_inicio' => substr($clase->hora_inicio, 0, 5),
                'hora_fin' => substr($clase->hora_fin, 0, 5),
                'aula' => $clase->aula,
                'duracion' => $clase->duracion_minutos,
            ];
        }
        
        return $horario;
    }

    /**
     * Clonar horario de un año a otro
     */
    public function clonarHorario(int $seccionId, int $anioOrigen, int $anioDestino): int
    {
        $clasesOrigen = HorarioClase::where('seccion_id', $seccionId)
            ->where('anio_escolar', $anioOrigen)
            ->get();

        $contador = 0;
        foreach ($clasesOrigen as $clase) {
            HorarioClase::create([
                'seccion_id' => $clase->seccion_id,
                'curso_id' => $clase->curso_id,
                'docente_id' => $clase->docente_id,
                'dia_semana' => $clase->dia_semana,
                'hora_inicio' => $clase->hora_inicio,
                'hora_fin' => $clase->hora_fin,
                'aula' => $clase->aula,
                'anio_escolar' => $anioDestino,
                'periodo' => $clase->periodo,
                'activo' => true,
            ]);
            $contador++;
        }

        return $contador;
    }
}
```

---

## 🎨 Interfaz de Usuario

### Vista Principal: Gestión de Horarios por Sección

```
┌─────────────────────────────────────────────────────────────┐
│  📅 Horario - 1° Grado A                    [+ Agregar Clase]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Año Escolar: [2026 ▼]    Periodo: [Anual ▼]               │
│                                                               │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┬──────┐│
│  │  Hora   │  Lunes  │ Martes  │Miércoles│ Jueves  │Viernes││
│  ├─────────┼─────────┼─────────┼─────────┼─────────┼──────┤│
│  │08:00-09:│Matemática│Historia │Matemática│Ciencias│Inglés││
│  │  00     │Prof.Juan│Prof.Ana │Prof.Juan│Prof.Luis│Prof.M││
│  │         │Aula 201 │Aula 105 │Aula 201 │Lab 1    │Aula 3││
│  │         │[✏️][🗑️] │[✏️][🗑️] │[✏️][🗑️] │[✏️][🗑️] │[✏️][🗑️]││
│  ├─────────┼─────────┼─────────┼─────────┼─────────┼──────┤│
│  │09:00-10:│Lenguaje │Matemática│Ciencias │Matemática│Arte  ││
│  │  00     │Prof.Ana │Prof.Juan│Prof.Luis│Prof.Juan│Prof.C││
│  │         │Aula 201 │Aula 201 │Lab 1    │Aula 201 │Aula 4││
│  ├─────────┼─────────┼─────────┼─────────┼─────────┼──────┤│
│  │10:00-10:│         RECREO (30 minutos)                   ││
│  │  30     │                                                ││
│  ├─────────┼─────────┼─────────┼─────────┼─────────┼──────┤│
│  │10:30-11:│Ciencias │Inglés   │Historia │Lenguaje │Ed.Fís││
│  │  30     │Prof.Luis│Prof.M   │Prof.Ana │Prof.Ana │Prof.P││
│  └─────────┴─────────┴─────────┴─────────┴─────────┴──────┘│
│                                                               │
│  📊 Resumen:                                                 │
│  • Total horas semanales: 25 horas                          │
│  • Promedio por día: 5 horas                                │
│  • Cursos asignados: 8                                      │
│                                                               │
│  [📥 Exportar PDF] [📋 Copiar a otra sección] [🔄 Clonar año]│
└─────────────────────────────────────────────────────────────┘
```

### Modal: Agregar/Editar Clase

```
┌──────────────────────────────────────┐
│  ➕ Agregar Clase al Horario         │
├──────────────────────────────────────┤
│                                      │
│  Día de la semana: *                │
│  [Lunes ▼]                          │
│                                      │
│  Hora inicio: *    Hora fin: *      │
│  [08:00]           [09:00]          │
│                                      │
│  Curso: *                           │
│  [Matemática ▼]                     │
│                                      │
│  Docente: *                         │
│  [Juan Pérez ▼]                     │
│                                      │
│  Aula: (opcional)                   │
│  [Aula 201]                         │
│                                      │
│  ⚠️ Conflictos detectados:          │
│  • El docente ya tiene clase de     │
│    Física en 2°B a esta hora        │
│                                      │
│  [Cancelar]  [Guardar de todas formas]│
└──────────────────────────────────────┘
```

---

## 📱 Vistas para Usuarios

### Portal Alumno: Mi Horario
- Ver horario semanal de su sección
- Resaltar la clase actual
- Mostrar próxima clase
- Opción de descargar como imagen/PDF

### Portal Docente: Mi Horario
- Ver todas sus clases de la semana
- Filtrar por día
- Ver carga horaria total
- Acceso rápido a cada curso

### Portal Admin: Gestión Completa
- Ver/editar horarios de todas las secciones
- Detectar conflictos
- Reportes de carga horaria por docente
- Clonar horarios entre años

---

## 🔄 Flujo de Trabajo

### 1. Configuración Inicial (Una vez por año)
```
Admin → Configurar Bloques Horarios
     → Definir horarios estándar (8:00-9:00, 9:00-10:00, etc.)
```

### 2. Asignación de Horarios (Inicio de año)
```
Admin → Seleccionar Sección (1°A)
     → Agregar clases una por una
     → Sistema detecta conflictos automáticamente
     → Guardar horario completo
```

### 3. Uso Diario
```
Alumno → Ver "Mi Horario"
      → Sistema resalta clase actual
      
Docente → Ver "Mis Clases de Hoy"
       → Click en clase → Ir a contenido del curso
```

---

## 🚀 Implementación por Fases

### Fase 1: Base (2-3 días)
- ✅ Migración de tablas
- ✅ Modelos y relaciones
- ✅ Servicio de horarios
- ✅ API endpoints básicos

### Fase 2: UI Admin (3-4 días)
- ✅ Página de gestión de horarios
- ✅ Tabla semanal interactiva
- ✅ Modal agregar/editar clase
- ✅ Detección de conflictos

### Fase 3: Portales (2-3 días)
- ✅ Vista de horario para alumnos
- ✅ Vista de horario para docentes
- ✅ Resaltar clase actual
- ✅ Exportar a PDF

### Fase 4: Extras (2-3 días)
- ✅ Clonar horarios entre años
- ✅ Reportes de carga horaria
- ✅ Notificaciones de próxima clase
- ✅ Integración con asistencia

---

## 💡 Ventajas del Sistema Propuesto

✅ **Organizado**: Cada sección tiene su horario estructurado
✅ **Sin conflictos**: Detecta automáticamente si un docente tiene dos clases al mismo tiempo
✅ **Flexible**: Soporta horarios diferentes por sección
✅ **Reportes**: Calcula carga horaria, horas por curso, etc.
✅ **Escalable**: Fácil agregar aulas, periodos, etc.
✅ **Integrable**: Se conecta con asistencia, cursos, calificaciones

---

## 🎯 Ejemplo de Uso Real

### Caso: Colegio con 3 secciones de 1er grado

**1° Grado A** (Turno Mañana)
- Lunes 8:00-9:00: Matemática (Prof. Juan, Aula 201)
- Lunes 9:00-10:00: Lenguaje (Prof. Ana, Aula 201)
- ...

**1° Grado B** (Turno Mañana)
- Lunes 8:00-9:00: Historia (Prof. Carlos, Aula 202)
- Lunes 9:00-10:00: Matemática (Prof. Juan, Aula 202)
- ...

**Sección Única** (Turno Tarde)
- Lunes 14:00-15:00: Matemática (Prof. Juan, Aula 201)
- ...

El sistema detecta que Prof. Juan puede dar clase en 1°A a las 8:00 y en 1°B a las 9:00 (sin conflicto), pero NO puede estar en dos lugares a las 8:00.

---

## 📋 Próximos Pasos

1. ¿Te parece bien este diseño?
2. ¿Necesitas agregar algo más? (ej: periodos bimestrales, horarios rotativos, etc.)
3. ¿Empezamos con la implementación?

Puedo generar:
- Migraciones completas
- Modelos con todas las relaciones
- Servicio con toda la lógica
- Controladores API
- Componentes React para la UI
