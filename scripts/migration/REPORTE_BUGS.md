# Reporte de Bugs — Script de Migración `edu_bautista → edu_bautista2`

**Fecha de análisis:** 2026-03-26
**Dump analizado:** `edu_bautista 20260324 1341.sql`
**Scripts analizados:** `scripts/migration/` (main.py, config.py, modules/*.py)
**Migraciones analizadas:** `database/migrations/` + `database/seeders/RolePermissionSeeder.php`

---

## Resumen ejecutivo

| # | Severidad | Módulo | Descripción corta |
|---|-----------|--------|-------------------|
| 1 | 🔴 CRÍTICO | `estudiantes` | 16 columnas no se migran — se pierden datos del alumno |
| 2 | 🔴 CRÍTICO | `usuarios → roles` | `ROL_MAP` usa nombres distintos a los del seeder — roles sin permisos |
| 3 | 🟠 ALTO | `mensajeria` | `remitente` es INT (usuario_id) pero se busca como username string |
| 4 | 🟡 MENOR | `pagos` | `pag_mes` llega como número (`'01'`) en vez de nombre (`'ENERO'`) |

---

## Bug #1 — `estudiantes`: se pierden 16 columnas de datos del alumno

### Severidad: 🔴 CRÍTICO

### Archivo afectado
`scripts/migration/modules/users.py` — función `migrate_estudiantes()`, líneas 83–98

### Descripción del problema

La tabla `estudiantes` del sistema antiguo tiene **21 columnas**. La nueva tabla en `edu_bautista2` también tiene esas mismas columnas (con algunos renombres). Sin embargo, el script de migración **solo transfiere 5 columnas básicas** y deja el resto en NULL.

### Comparativa de columnas

#### Tabla antigua (`edu_bautista.estudiantes`)
```sql
CREATE TABLE `estudiantes` (
  `estu_id`             int(11),
  `insti_id`            int(11),
  `perfil_id`           int(11),
  `usuario_id`          int(11),   -- FK a usuarios
  `estado`              char(1),
  `foto`                varchar(255),
  `colegio`             varchar(255),
  `neurodivergencia`    varchar(255),
  `redes`               varchar(10),
  `facebook`            varchar(255),
  `instagram`           varchar(255),
  `tiktok`              varchar(255),
  `terapia_ocupacional` varchar(255),
  `Seguro`              varchar(255),   -- mayúscula
  `Privado`             varchar(255),   -- mayúscula
  `fecha_i`             date,
  `fecha_p`             date,
  `mensualidad`         decimal(14,2),
  `edad`                int(11),
  `talla`               varchar(50),
  `peso`                decimal(14,2)
)
```

#### Tabla nueva (`edu_bautista2.estudiantes`)
```sql
Schema::create('estudiantes', function (Blueprint $table) {
    $table->id('estu_id');
    $table->unsignedBigInteger('insti_id');
    $table->unsignedBigInteger('perfil_id');
    $table->unsignedBigInteger('user_id');          -- renombrado de usuario_id
    $table->char('estado', 1);
    $table->string('foto', 255);
    $table->string('colegio', 255);
    $table->string('neurodivergencia', 255);        -- igual
    $table->string('terapia_ocupacional', 255);     -- igual
    $table->integer('edad');
    $table->string('talla', 50);
    $table->decimal('peso', 14, 2);
    $table->string('seguro', 255);                  -- renombrado de Seguro
    $table->string('privado', 255);                 -- renombrado de Privado
    $table->string('redes', 10);
    $table->string('facebook', 255);
    $table->string('instagram', 255);
    $table->string('tiktok', 255);
    $table->date('fecha_ingreso');                  -- renombrado de fecha_i
    $table->date('fecha_promovido');                -- renombrado de fecha_p
    $table->decimal('mensualidad', 14, 2);
});
```

#### Lo que el script actualmente hace

```python
sql = """
    INSERT INTO estudiantes
        (estu_id, insti_id, perfil_id, user_id, estado,
         created_at, updated_at)
    VALUES
        (%(estu_id)s, %(insti_id)s, %(perfil_id)s, %(user_id)s,
         %(estado)s, %(ts)s, %(ts)s)
"""
```

Solo inserta 5 columnas. **Las 16 restantes quedan en NULL en el destino.**

#### Detalle columna por columna

| Columna antigua | Columna nueva | ¿Requiere renombre? | Estado actual |
|-----------------|---------------|---------------------|---------------|
| `estu_id` | `estu_id` | No | ✅ Migrado |
| `insti_id` | `insti_id` | No | ✅ Migrado |
| `perfil_id` | `perfil_id` | No | ✅ Migrado |
| `usuario_id` | `user_id` | **Sí** | ✅ Migrado (vía user_id_map) |
| `estado` | `estado` | No | ✅ Migrado |
| `foto` | `foto` | No | ❌ **NO migrado** |
| `colegio` | `colegio` | No | ❌ **NO migrado** |
| `neurodivergencia` | `neurodivergencia` | No | ❌ **NO migrado** |
| `redes` | `redes` | No | ❌ **NO migrado** |
| `facebook` | `facebook` | No | ❌ **NO migrado** |
| `instagram` | `instagram` | No | ❌ **NO migrado** |
| `tiktok` | `tiktok` | No | ❌ **NO migrado** |
| `terapia_ocupacional` | `terapia_ocupacional` | No | ❌ **NO migrado** |
| `Seguro` | `seguro` | **Sí** (mayúscula) | ❌ **NO migrado** |
| `Privado` | `privado` | **Sí** (mayúscula) | ❌ **NO migrado** |
| `fecha_i` | `fecha_ingreso` | **Sí** | ❌ **NO migrado** |
| `fecha_p` | `fecha_promovido` | **Sí** | ❌ **NO migrado** |
| `mensualidad` | `mensualidad` | No | ❌ **NO migrado** |
| `edad` | `edad` | No | ❌ **NO migrado** |
| `talla` | `talla` | No | ❌ **NO migrado** |
| `peso` | `peso` | No | ❌ **NO migrado** |

#### Ejemplo de dato en el sistema antiguo

```sql
INSERT INTO `estudiantes` VALUES
  (1800, 8, 2010, 18021, '1', NULL, '', '', 'SI', '', '', '',
   '', '', '', '2026-03-05', '2026-03-05', '450.00', 14, '1.20', '60.00');
```

Después de la migración actual, `mensualidad`, `edad`, `talla`, `peso`, `fecha_ingreso`, `fecha_promovido` quedan en NULL para ese alumno.

### Impacto

- **Pérdida de historial médico/físico** (talla, peso, edad, seguro).
- **Pérdida de datos financieros** (mensualidad por alumno).
- **Pérdida de fechas académicas** (fecha de ingreso, fecha de promoción).
- **Pérdida de datos de contacto y social** (foto, facebook, tiktok, etc.).
- El sistema nuevo mostrará alumnos "vacíos" sin información.

---

## Bug #2 — Roles: `ROL_MAP` usa nombres distintos a los del seeder

### Severidad: 🔴 CRÍTICO

### Archivos afectados
- `scripts/migration/modules/core.py` — `ROL_MAP`, `SPATIE_ROLES`, `_ensure_spatie_roles()`, líneas 4–71
- `database/seeders/RolePermissionSeeder.php` — líneas 50–91

### Descripción del problema

El `RolePermissionSeeder.php` de Laravel crea los roles con nombres específicos y les asigna permisos. El script de migración, por otro lado, crea sus propios roles con **nombres diferentes** en la misma tabla `roles`, y asigna a los usuarios a esos roles incorrectos.

#### Roles que crea el seeder de Laravel

```php
Role::firstOrCreate(['name' => 'administrador']);   // con TODOS los permisos
Role::firstOrCreate(['name' => 'docente']);          // con permisos académicos
Role::firstOrCreate(['name' => 'estudiante']);       // con permisos de lectura
Role::firstOrCreate(['name' => 'padre_familia']);    // notas, asistencia, reportes
Role::firstOrCreate(['name' => 'madre_familia']);    // notas, asistencia, reportes
Role::firstOrCreate(['name' => 'apoderado']);        // notas, asistencia, reportes
Role::firstOrCreate(['name' => 'psicologo']);        // psicología y reportes
```

#### Roles que crea el script de migración

```python
SPATIE_ROLES = ["admin", "docente", "padre", "estudiante"]

ROL_MAP = {
    1: "admin",       # debería ser "administrador"
    2: "estudiante",  # ✓ correcto
    3: "padre",       # debería ser "padre_familia"
    4: "padre",       # debería ser "apoderado"
    5: "padre",       # debería ser "madre_familia"
    6: "docente",     # ✓ correcto
    7: "docente",     # debería ser "psicologo"
}
```

#### Tabla de discrepancias

| id_rol antiguo | Nombre antiguo | Nombre en seeder | Nombre en script | ¿Correcto? |
|----------------|----------------|-----------------|------------------|-----------|
| 1 | ADMINISTRADOR | `administrador` | `admin` | ❌ Distinto |
| 2 | ESTUDIANTE | `estudiante` | `estudiante` | ✅ OK |
| 3 | PADRE DE FAMILIA | `padre_familia` | `padre` | ❌ Distinto |
| 4 | APODERADO | `apoderado` | `padre` | ❌ Distinto (además se fusionan) |
| 5 | MADRE DE FAMILIA | `madre_familia` | `padre` | ❌ Distinto (además se fusionan) |
| 6 | DOCENTE | `docente` | `docente` | ✅ OK |
| 7 | PSICOLOGO | `psicologo` | `docente` | ❌ Distinto (además fusionado con docente) |

#### Qué ocurre a nivel de base de datos

Si el seeder **se ejecutó antes** de la migración (flujo normal con `php artisan db:seed`):

La tabla `roles` ya tiene:

| id | name |
|----|------|
| 1 | `administrador` |
| 2 | `docente` |
| 3 | `estudiante` |
| 4 | `padre_familia` |
| 5 | `madre_familia` |
| 6 | `apoderado` |
| 7 | `psicologo` |

El script llama a `_ensure_spatie_roles()` que hace `INSERT IGNORE` de `["admin", "docente", "padre", "estudiante"]`. Después de esto, la tabla `roles` queda:

| id | name |
|----|------|
| 1 | `administrador` ← tiene todos los permisos |
| 2 | `docente` ← tiene permisos académicos |
| 3 | `estudiante` ← tiene permisos de lectura |
| 4 | `padre_familia` ← tiene permisos base |
| 5 | `madre_familia` ← tiene permisos base |
| 6 | `apoderado` ← tiene permisos base |
| 7 | `psicologo` ← tiene permisos de psicología |
| 8 | `admin` ← **sin ningún permiso** |
| 9 | `padre` ← **sin ningún permiso** |

El usuario administrador (id_rol=1) queda asignado al rol `admin` (id=8, sin permisos). Entra al sistema con rol incorrecto. El administrador real de la escuela **no puede acceder a ninguna sección**.

#### Impacto adicional: roles 3, 4, 5 se fusionan en uno solo

El script asigna a padres, madres y apoderados todos al mismo rol `padre`. Esto elimina la distinción entre ellos que el seeder sí mantiene (`padre_familia`, `madre_familia`, `apoderado`).

### Impacto

- El administrador migrado no tiene permisos → no puede acceder al panel.
- Padres, madres y apoderados quedan en rol genérico sin permisos.
- El psicólogo queda con rol de docente (acceso incorrecto a funciones académicas).

---

## Bug #3 — `mensajeria`: `remitente` es INT pero se trata como username

### Severidad: 🟠 ALTO

### Archivo afectado
`scripts/migration/modules/messaging.py` — funciones `migrate_mensajes()` y `migrate_mensajes_respuestas()`, líneas 145–163 y 236–241

### Descripción del problema

#### Esquema antiguo de `mensaje_usuarion`

```sql
CREATE TABLE `mensaje_usuarion` (
  `mensaje_id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario`  int(11) DEFAULT NULL,   -- usuario_id del destinatario
  `remitente`   int(11) DEFAULT NULL,   -- usuario_id del remitente
  CONSTRAINT FK FOREIGN KEY (`remitente`) REFERENCES `usuarios` (`usuario_id`)
)
```

`remitente` es un **entero** que referencia `usuarios.usuario_id` (p.ej.: `17730`, `18021`).

#### Lo que hace el script

```python
# Construye el mapa: {username_string → new_user_id}
username_map = {r["username"]: r["id"] for r in ...}   # e.g. {"admin": 1, "42799618": 2}

# Al migrar mensajes:
remitente_str = str(r.get("remitente") or "").strip()  # "17730"
remitente_id  = username_map.get(remitente_str)         # busca "17730" como username → None
```

El valor `17730` es el `usuario_id` del usuario cuyo username es `"admin"`. Buscar `"17730"` en el `username_map` falla porque la clave del mapa es `"admin"`, no `"17730"`.

Lo correcto sería usar `user_id_map` (que mapea `{old_usuario_id → new_user_id}`):

```python
# Lo correcto:
remitente_id = user_id_map.get(r.get("remitente"))
```

El mismo error ocurre en `mensajeria_respuestas`:
```python
# Bug actual:
user_str = str(r.get("id_usuario") or "").strip()
user_id  = username_map.get(user_str)   # id_usuario es INT, no username

# Lo correcto:
user_id = user_id_map.get(r.get("id_usuario"))
```

#### Situación en el dump actual

La tabla `mensaje_usuarion` está **vacía** en el dump analizado (no hay filas). Por lo tanto este bug no causa pérdida de datos con los datos actuales, pero **fallará en producción** si el sistema antiguo tiene mensajes reales.

### Impacto

- Todos los mensajes con `remitente` no-nulo fallarían con `remitente_id = None`.
- El script los omite con `errors += 1` → pérdida total de mensajes.
- Las respuestas a mensajes también se perderían.

---

## Bug #4 — `pagos`: `pag_mes` llega como número, no como nombre de mes

### Severidad: 🟡 MENOR

### Archivo afectado
`scripts/migration/modules/payments.py` — línea 73 (dentro del INSERT)

### Descripción del problema

La tabla antigua `pagos_notifica` almacena el mes como un **número en string**:

```sql
-- Dato real del dump:
INSERT INTO `pagos_notifica` VALUES
  (72, 2026, '01', 'NO', '0.00', '2026-01-07', 17868, ...);
--                ^^^^
--                pag_mes = '01'
```

La nueva tabla `pagos` define la columna así:

```php
$table->string('pag_mes', 20);  // ENERO … DICIEMBRE  ← comentario del migration
```

El script copia el valor tal cual:

```python
params = {
    ...
    "pag_mes": r.get("pag_mes"),  # copia '01' sin conversión
    ...
}
```

Resultado: en `edu_bautista2.pagos`, `pag_mes` tiene valores `'01'`, `'02'`, etc. en lugar de `'ENERO'`, `'FEBRERO'`, etc.

#### Tabla de conversión necesaria

| Valor antiguo | Valor esperado en nuevo sistema |
|---------------|---------------------------------|
| `'01'` o `'1'` | `'ENERO'` |
| `'02'` o `'2'` | `'FEBRERO'` |
| ... | ... |
| `'12'` | `'DICIEMBRE'` |

### Impacto

- El módulo de pagos puede mostrar `"01"` en lugar de `"ENERO"` en el historial de pagos del alumno.
- Si el frontend filtra por mes usando el nombre (p.ej. `WHERE pag_mes = 'ENERO'`), no encontrará registros.
- Si el frontend filtra usando el número, funcionará pero el dato no será consistente con los pagos creados desde el nuevo sistema (que sí guardan el nombre).

---

## Módulos sin bugs confirmados ✅

| Módulo / Tabla | Observaciones |
|----------------|---------------|
| `institucion_educativa` | Mapeo 1:1, sin cambios. OK. |
| `usuarios → users` (columnas básicas) | `usuario→username`, `clave→password` (re-hash bcrypt), `fecha_creacion→created_at`. OK. |
| `perfiles` | `doc_id→tipo_doc`, `telefono_pricipal→telefono` (typo corregido), `id_usuario→user_id` vía map. OK. |
| `docentes` | Columnas coinciden. `estado` hardcodeado a `'1'` (el original no tenía estado). OK. |
| `niveles_educativos` | Mapeo directo. OK. |
| `grados` | Mapeo directo. OK. |
| `secciones` | Mapeo directo. OK. |
| `cursos` | Mapeo directo. OK. |
| `padre_apoderado` | `email_concto→email_contacto` (typo corregido), `id_insti→insti_id`, `id_usuario→user_id` vía map. OK. |
| `estudiante_contacto` | Typo `id_estuddiante` en origen manejado correctamente. OK. |
| `pagos` (estructura general) | `pag_otro3..5` y `pag_nombre3..4` ignorados correctamente. `pag_fecha` (varchar→date) truncado a 10 chars. OK (salvo bug #4). |
| `institucion_noticias` | Solo migra `not_estatus='1'` (activas). OK. |
| `institucion_galeria` | Mapeo directo. OK. |
| Contraseñas | Se re-hashean en bcrypt con `$2y$` (compatible con PHP). OK. |
| Duplicados de username | Se detectan y omiten con log. OK. |
| Idempotencia | Todos los módulos verifican existencia antes de insertar. OK. |

---

## Prioridad de correcciones

| Prioridad | Bug | Acción |
|-----------|-----|--------|
| **1 — Inmediata** | #2 Roles | Cambiar `ROL_MAP` y `SPATIE_ROLES` para alinear con los nombres del seeder (`administrador`, `padre_familia`, etc.) |
| **2 — Inmediata** | #1 Estudiantes | Añadir los 16 campos faltantes al INSERT de `migrate_estudiantes`, con los renombres correctos |
| **3 — Antes de migrar mensajería** | #3 Mensajería | Reemplazar `username_map.get(remitente_str)` por `user_id_map.get(r.get("remitente"))` |
| **4 — Baja prioridad** | #4 Pagos | Agregar conversión de número a nombre de mes si el frontend lo requiere |

---

## Procedimiento recomendado para re-migrar

1. Limpiar la base `edu_bautista2`: `php artisan migrate:fresh --seed` (crea tablas + roles correctos con el seeder).
2. Corregir los bugs #1, #2 y #3 en los scripts.
3. Ejecutar en modo simulación: `python main.py --dry-run` y revisar el log.
4. Ejecutar la migración real: `python main.py`.
5. Verificar manualmente una muestra de estudiantes, usuarios con rol admin y docente.
